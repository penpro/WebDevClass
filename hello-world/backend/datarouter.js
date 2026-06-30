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
// Auth: shared secret from CRASH_INGEST_KEY env var. Accept either the
// X-Crash-Key request header or a ?key= query param (CRC's URL-only config
// pattern needs the query option). 401 on miss — CRC retries on 5xx but
// NOT on 4xx, which is what we want (a bad-key flood doesn't get amplified
// into a retry storm).
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
// endpoint. A request that exceeds this gets the connection killed and a
// 413; the half-written file is removed.
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

router.post('/crashes', async (req, res) => {
  const expected = process.env.CRASH_INGEST_KEY;
  if (!expected) {
    // Refuse to accept anything until the operator configures the key.
    // 503 (not 401) so the failure mode is visibly a server-side gap, not
    // "your client has a bad key."
    console.error('[crash] CRASH_INGEST_KEY not set; rejecting');
    return res.status(503).json({ error: 'crash ingest not configured' });
  }

  const offered = req.header('x-crash-key') || req.query.key;
  if (!safeCompare(offered, expected)) {
    return res.status(401).json({ error: 'invalid key' });
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
  let oversize = false;

  // Enforce the cap as bytes arrive, not on Content-Length (a hostile or
  // buggy client can lie about Content-Length, or chunked-transfer without
  // declaring one at all).
  req.on('data', (chunk) => {
    receivedBytes += chunk.length;
    if (receivedBytes > MAX_BODY_BYTES) {
      oversize = true;
      req.destroy();
    }
  });

  const writeStream = fs.createWriteStream(binPath);
  try {
    await pipeline(req, writeStream);
  } catch (err) {
    fs.promises.unlink(binPath).catch(() => {});
    if (oversize) {
      return res.status(413).json({ error: 'body too large' });
    }
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
