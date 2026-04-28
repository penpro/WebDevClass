// Header-gated synthetic endpoints used purely for load testing.
//
// Every endpoint here requires the X-Diagnostic-Run header to match a
// currently-active diagnostics run id (the same header used to bypass
// maintenance mode). Without it the routes return 404, so they're
// invisible to anyone who isn't running a test through the diagnostics
// page. That means we don't need to worry about random users finding
// these and DOSing the site through them — there's no valid token for
// outsiders to discover.
//
// Mounted at /api/loadtest by server.js.

const express = require('express');

const maintenanceState = require('./maintenanceState');

const router = express.Router();

// Gate: require an active run header. Returns 404 (not 401) so the
// endpoints look indistinguishable from non-existent routes to anyone
// who doesn't have a valid token. This is "security by header secret"
// not "security by endpoint privacy" — the token is 128-bit random and
// only valid during the test that minted it.
router.use((req, res, next) => {
  const id = req.headers['x-diagnostic-run'];
  if (!id || !maintenanceState.isActiveRunId(id)) {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
});

// GET /api/loadtest/block?ms=N
//
// Synchronous busy-wait for ms milliseconds, then return JSON. This
// deliberately blocks Node's event loop, which is THE classic way to
// tank a Node server under concurrency: while one request is busy-
// waiting nothing else can run, including other incoming requests
// (which queue up in the kernel) and the SSE heartbeats from the
// diagnostics page (which is why the diagnostics UI may go briefly
// unresponsive during this test — that's the lived experience of
// "what happens when an endpoint blocks").
//
// ms is clamped to [0, 1000] per request — so even if the test fires
// thousands of requests, no single one wedges the server for more
// than a second. The test as a whole is what generates the queue.
router.get('/block', (req, res) => {
  const requested = Number(req.query.ms);
  const ms = Math.min(1000, Math.max(0, Number.isFinite(requested) ? requested : 100));
  const start = Date.now();
  // Intentionally synchronous busy-wait. setImmediate / setTimeout would
  // yield back to the event loop and defeat the whole point.
  // eslint-disable-next-line no-empty
  while (Date.now() - start < ms) {}
  res.json({ ms });
});

module.exports = router;
