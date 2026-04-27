// k6 stress test: ramp from 10 to 100 concurrent users over 2 minutes
// hitting the API. Designed to find the breaking point.
//
// On our stack the FIRST breaking point you'll see is the rate limiter
// (100 req/min/IP on /api/*). Once you exceed that, the limiter starts
// returning 429 Too Many Requests immediately — you'll see that in the
// http_req_failed rate climbing, and in the rate_limit_hits custom
// metric below.
//
// To find the SECOND bottleneck (the actual application/DB ceiling
// behind the limiter), temporarily comment out the
//   app.use('/api', globalLimiter)
// line in hello-world/backend/server.js, restart with
//   pm2 restart hello-backend
// and re-run this test. Re-enable the limiter when you're done.
//
// Run:
//   k6 run hello-world/loadtests/api-stress.js
//
// Output to look at:
//   http_reqs .................. total requests sent
//   http_req_failed ............ % of requests that didn't return 200
//   http_req_duration p(95) .... how slow the slowest 5% of requests were
//   rate_limit_hits ............ count of 429 responses (custom metric)

import http from 'k6/http'
import { check } from 'k6'
import { Counter } from 'k6/metrics'

const rateLimitHits = new Counter('rate_limit_hits')

export const options = {
  // Stages give a ramping load profile: many systems behave fine at
  // low concurrency and degrade non-linearly past some threshold.
  // Watching where p(95) latency or error rate inflects tells you
  // where that threshold is.
  stages: [
    { duration: '30s', target: 10 }, // warm up to 10 VUs
    { duration: '60s', target: 50 }, // ramp to 50 VUs over 60s
    { duration: '30s', target: 100 }, // ramp to 100 VUs
    { duration: '30s', target: 100 }, // hold at 100 VUs
    { duration: '30s', target: 0 } // ramp back down
  ],
  // No thresholds here — we're explicitly trying to break things, so
  // failures are part of what we're measuring.
}

const BASE_URL = __ENV.BASE_URL || 'https://penumbrapro.duckdns.org'

export default function () {
  const res = http.get(`${BASE_URL}/api/messages`)

  check(res, {
    'status is 200': (r) => r.status === 200
  })

  if (res.status === 429) {
    rateLimitHits.add(1)
  }

  // No sleep between requests — this is a stress test, we want each
  // VU pushing as hard as it can.
}
