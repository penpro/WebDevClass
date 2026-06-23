// k6 load test: a moderate, sustained load on a database-backed API
// endpoint, deliberately tuned to stay UNDER our rate limiter so the
// numbers reflect actual application performance instead of the
// limiter rejecting requests.
//
// Target: GET /api/messages — public, no auth, hits MySQL with a
// trivial SELECT. Good representative of "API endpoint that does a DB
// read."
//
// The global rate limiter is 100 req/min/IP on /api/*. We aim for
// roughly 1.5 req/sec total (~90 req/min) to stay under that, with
// 10 virtual users sharing the budget.
//
// Run:
//   k6 run hello-world/loadtests/api-baseline.js
//
// What to look at:
//   http_req_duration .. avg / p(95) / p(99) latency for a real DB read
//   http_req_failed .... should be near zero (no rate-limit rejections)
//
// Expected ballpark on a t3.micro: p(95) well under 100ms, 0% failures.

import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 10,
  duration: '60s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500']
  }
}

const BASE_URL = __ENV.BASE_URL || 'https://penumbra-tech.com'

// Bypass maintenance mode when launched from the diagnostics router.
// See homepage.js for the full explanation.
const RUN_ID = __ENV.DIAG_RUN_ID || ''
const params = RUN_ID ? { headers: { 'X-Diagnostic-Run': RUN_ID } } : {}

export default function () {
  const res = http.get(`${BASE_URL}/api/messages`, params)

  check(res, {
    'status is 200': (r) => r.status === 200,
    'returned an array': (r) => {
      try {
        return Array.isArray(r.json())
      } catch {
        return false
      }
    }
  })

  // Each VU sleeps ~6.7s between requests → 10 VUs × (1/6.7) req/s
  // ≈ 1.5 req/s total, ≈ 90 req/min total — comfortably under the
  // 100 req/min/IP rate limit.
  sleep(6.7)
}
