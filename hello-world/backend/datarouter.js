// datarouter — Unreal Engine 5.x CrashReportClient ingest.
//
// CRC POSTs a binary crash bundle (zipped minidump + CrashContext xml + logs,
// typically a few MB, up to ~50 MB on outlier crashes) to a configured
// DataRouter URL. We stream the raw body to local disk lossless. No parsing
// in v1 — the on-the-wire container format varies by engine version and we
// verify the format against a real captured crash before writing a decoder.
//
// Storage layout:
//   /home/ubuntu/crash-dumps/{AppVersion}/{YYYY-MM-DD}/{uuid}.bin    raw bundle
//   /home/ubuntu/crash-dumps/{AppVersion}/{YYYY-MM-DD}/{uuid}.json   sidecar metadata
//
// Auth: shared secret from CRASH_INGEST_KEY env var, supplied as the path
// segment after /crashes/.  Query-string auth would collide with the
// "?AppID=...&AppVersion=..." that CRC unconditionally appends to whatever
// URL is configured: two '?' separators in one URL → broken parsing.
// Path-segment auth dodges that entirely and CRC's appended query string
// rides along normally as req.query.  401 on miss — CRC retries on 5xx
// but NOT on 4xx, which is what we want (a bad-key flood doesn't get
// amplified into a retry storm).
//
// Mounted in server.js BEFORE express.json() so the raw stream stays
// available — express.json() would consume the body for any
// application/json content type.

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

const router = express.Router();

const DUMP_DIR = process.env.CRASH_DUMP_DIR || '/home/ubuntu/crash-dumps';

// Hard cap. The spec says design for ~50 MB; we accept up to 60 to absorb
// envelope overhead and the rare outlier without becoming a free upload
// endpoint. The cap is enforced two ways, in this order:
//
//   1. Express checks Content-Length upfront and 413s without reading the
//      body if it's declared and too large. This is the clean path real
//      clients (including CRC, which always sets Content-Length) hit.
//   2. nginx caps the actual byte count at 70 MB via client_max_body_size
//      on the /datarouter/ location. This catches lying clients and
//      chunked-encoding bodies with no Content-Length — nginx aborts the
//      connection cleanly at the proxy layer, no half-written file on
//      this side because the upstream stream never delivers more bytes
//      than the cap.
//
// We don't try a mid-stream Express-level abort (req.destroy() during the
// pipeline) because that closes the upstream socket while nginx is mid-
// proxy and nginx returns 502 Bad Gateway to the client — a confusing
// failure mode for what should be a clean 413.
const MAX_BODY_BYTES = 60 * 1024 * 1024;

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// Anything user-controlled that becomes part of a filesystem path needs to
// be restricted to a safe charset — `..`, `/`, `\`, NUL, and weird unicode
// are all on the table when CRC's query params come from arbitrary
// game-side strings or a forged request.
function sanitizeSegment(s, fallback) {
  if (typeof s !== 'string') return fallback;
  const cleaned = s.replace(/[^A-Za-z0-9._-]/g, '').slice(0, 64);
  return cleaned || fallback;
}

router.post('/crashes/:key', async (req, res) => {
  const expected = process.env.CRASH_INGEST_KEY;
  if (!expected) {
    // Refuse to accept anything until the operator configures the key.
    // 503 (not 401) so the failure mode is visibly a server-side gap, not
    // "your client has a bad key."
    console.error('[crash] CRASH_INGEST_KEY not set; rejecting');
    return res.status(503).json({ error: 'crash ingest not configured' });
  }

  if (!safeCompare(req.params.key, expected)) {
    return res.status(401).json({ error: 'invalid key' });
  }

  // Upfront Content-Length check. Real CRC always sets it; this is the
  // clean rejection path for outlier crashes that exceed our cap.
  const declared = Number(req.header('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'body too large' });
  }

  const appVersion = sanitizeSegment(req.query.AppVersion, 'unknown');
  const dateBucket = new Date().toISOString().slice(0, 10);
  const id = crypto.randomUUID();
  const dir = path.join(DUMP_DIR, appVersion, dateBucket);
  const binPath = path.join(dir, `${id}.bin`);
  const metaPath = path.join(dir, `${id}.json`);

  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('[crash] mkdir failed:', err);
    return res.status(500).json({ error: 'storage init failed' });
  }

  let receivedBytes = 0;
  // Count bytes as they arrive so the sidecar gets the actual size, which
  // we trust over Content-Length when the two disagree.
  req.on('data', (chunk) => {
    receivedBytes += chunk.length;
  });

  const writeStream = fs.createWriteStream(binPath);
  try {
    await pipeline(req, writeStream);
  } catch (err) {
    fs.promises.unlink(binPath).catch(() => {});
    console.error('[crash] stream failed:', err);
    return res.status(500).json({ error: 'write failed' });
  }

  const meta = {
    id,
    receivedAt: new Date().toISOString(),
    clientIp: req.ip,
    contentType: req.header('content-type') || null,
    contentLength: receivedBytes,
    userAgent: req.header('user-agent') || null,
    query: req.query
  };

  try {
    await fs.promises.writeFile(metaPath, JSON.stringify(meta, null, 2));
  } catch (err) {
    // The crash bytes are already on disk, which is the lossless part of
    // the contract. The sidecar is a convenience — log the failure but
    // don't make the client retry over it.
    console.error('[crash] meta write failed:', err);
  }

  console.log(
    `[crash] ${receivedBytes}b from ${req.ip} → ${appVersion}/${dateBucket}/${id}`
  );
  res.status(200).end();
});

module.exports = router;
