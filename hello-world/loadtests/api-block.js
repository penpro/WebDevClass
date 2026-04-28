// k6 test: hammer a deliberately-blocking endpoint with concurrent VUs
// to demonstrate Node's single-threaded weakness.
//
// The endpoint is /api/loadtest/block?ms=100 — a synchronous busy-wait
// for 100 ms before responding. Since Node runs JS on a single thread,
// while one request is busy-waiting, every other request (including
// the SSE stream feeding the diagnostics page!) queues up behind it.
// With 100 VUs each pushing as fast as they can:
//
//   * Effective throughput plateaus at ~10 req/s (1 / 100ms = 10/s
//     per worker, and there's only one worker).
//   * Latency climbs unboundedly as VUs add to the queue faster than
//     the queue drains.
//   * Eventually nginx hits its proxy_read_timeout (60s) and starts
//     returning 504 Gateway Timeout.
//   * The Diagnostics page itself may go unresponsive — that's the
//     live experience of "what an event-loop block feels like."
//
// THIS is what hard failure looks like, vs the graceful degradation
// you saw on api-overload (which just measured the box's CPU ceiling
// while every request still completed).
//
// The test runs for ~3 minutes total. Stop button works as expected.

import http from 'k6/http'
import { check } from 'k6'

export const options = {
  stages: [
    { duration: '15s', target: 20 },   // warm
    { duration: '60s', target: 60 },   // ramp to heavy queue
    { duration: '60s', target: 120 },  // ramp to extreme queue
    { duration: '30s', target: 0 }     // ramp down
  ]
  // No thresholds — we expect timeouts, that's the whole point.
}

const BASE_URL = __ENV.BASE_URL || 'https://penumbrapro.duckdns.org'
const RUN_ID = __ENV.DIAG_RUN_ID || ''
const params = RUN_ID ? { headers: { 'X-Diagnostic-Run': RUN_ID } } : {}

export default function () {
  const res = http.get(`${BASE_URL}/api/loadtest/block?ms=100`, params)
  check(res, {
    'status is 200': (r) => r.status === 200
  })
  // No sleep — push as hard as each VU can.
}
