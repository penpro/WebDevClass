// k6 overload test: aggressive ramp 50 -> 200 -> 500 -> 0 VUs over ~4 mins.
//
// This is the "actually try to break it" test. It's designed to push the
// API endpoint past the point where the bottleneck is the rate limiter or
// the network round-trip, into territory where the t3.micro can't physically
// serve any faster.
//
// IMPORTANT: run this with the rate limiter DISABLED via the toggle on the
// Diagnostics page (or DISABLE_RATE_LIMITS=true on the env). With the
// limiter on, all this measures is how fast the limiter can return 429s
// under siege.
//
// Things to watch on the live charts:
//   * p(95) latency climbs steadily as VUs ramp — that's CPU saturation
//   * http_req_failed > 0 even with limiter off — that's connection timeouts
//     or socket exhaustion, the actual ceiling
//   * Server CPU chart pegs at 100% and stays there
//   * req/s plateaus instead of rising linearly with VUs — also the ceiling
//
// Note: k6 runs ON the EC2 instance (it's spawned by the diagnostics
// router). With 500 VUs hammering /api/messages from the same box, k6
// itself competes with node + nginx + mysql for CPU. The numbers are
// somewhat pessimistic vs. the same load from a separate machine, but the
// inflection points are still meaningful.

import http from 'k6/http'
import { check } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // warm up to moderate
    { duration: '60s', target: 200 },  // ramp to heavy
    { duration: '60s', target: 500 },  // ramp to extreme
    { duration: '60s', target: 500 },  // hold at extreme
    { duration: '30s', target: 0 }     // ramp back down
  ]
  // No thresholds — we expect failures, that's the whole point.
}

const BASE_URL = __ENV.BASE_URL || 'https://penumbra-tech.com'

// Bypass maintenance mode when launched from the diagnostics router.
// Critical for this script in particular: it auto-enables maintenance,
// and without the header every request would hit the 503 path instead
// of the actual app — turning the test into a measurement of the
// maintenance middleware's throughput, not the application ceiling.
const RUN_ID = __ENV.DIAG_RUN_ID || ''
const params = RUN_ID ? { headers: { 'X-Diagnostic-Run': RUN_ID } } : {}

export default function () {
  const res = http.get(`${BASE_URL}/api/messages`, params)

  check(res, {
    'status is 200': (r) => r.status === 200
  })

  // No sleep — every VU pushes as hard as it can.
}
