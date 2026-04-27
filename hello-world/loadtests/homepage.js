// k6 load test: 50 concurrent users hitting the homepage for 30 seconds.
//
// The homepage is a static index.html served directly by nginx from
// /var/www/hello-app — no Express, no MySQL, no rate limiter. This is
// the closest thing to a "raw nginx serving a tiny file" benchmark and
// gives us a ceiling for what the network + nginx can do before we
// even involve the application.
//
// Run:
//   k6 run hello-world/loadtests/homepage.js
//
// What to look at in the summary:
//   http_reqs ........ total requests + req/sec rate
//   http_req_duration  avg / median / p(95) / p(99) latency
//   checks ........... pass rate of the assertions below
//
// Expected ballpark on a t3.micro: hundreds of req/sec, p(95) under
// 200ms, near-100% success. nginx is fast at serving static files.

import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    // Fail the test if more than 1% of requests fail
    http_req_failed: ['rate<0.01'],
    // Fail the test if p(95) latency goes over 1 second
    http_req_duration: ['p(95)<1000']
  }
}

const BASE_URL = __ENV.BASE_URL || 'https://penumbrapro.duckdns.org'

export default function () {
  const res = http.get(`${BASE_URL}/`)

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response under 500ms': (r) => r.timings.duration < 500,
    'looks like our SPA': (r) =>
      typeof r.body === 'string' && r.body.includes('<div id="root">')
  })

  // Small sleep so we don't hammer harder than 50 concurrent users
  // would naturally — gives a more realistic request cadence.
  sleep(0.1)
}
