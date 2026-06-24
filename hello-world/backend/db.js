require('dotenv').config();
const mysql = require('mysql2/promise');

// Pool tuning notes:
//   * connectionLimit 25 — well above the 10-default. The k6 stress tests
//     happily push 100+ concurrent VUs; with the default cap, requests
//     beyond the 10th would silently queue on the driver side and surface
//     as latency spikes that don't correlate with anything in the app.
//   * waitForConnections / queueLimit — surface saturation as a 500 fast
//     instead of an unbounded queue that holds requests until they time
//     out at the nginx layer.
//   * enableKeepAlive — sends a TCP keepalive so a stale connection
//     reaped by the MySQL wait_timeout (8h by default) is detected
//     before the next query bombs with ECONNRESET.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 25,
  waitForConnections: true,
  queueLimit: 100,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

module.exports = pool;
