// Single-purpose module: holds a runtime-mutable "maintenance mode" flag
// plus an associated user-facing message.
//
// When enabled, the server.js maintenance middleware returns 503 with the
// stored message for any non-bypassed API request. The bypass paths in
// server.js are designed so a super_admin can ALWAYS get themselves back
// in even if maintenance is on:
//   - /api/auth/*   (so admins can log in)
//   - /api/admin/*  (so the diagnostics toggle is reachable)
//
// State is in-memory only. On a process restart it reverts to disabled.
// That's deliberate: if every other recovery fails, a `pm2 restart
// hello-backend` always brings the site back up, with no lingering flag
// to dig out of a config file.
//
// The Diagnostics page toggles this flag manually, AND the api-overload
// test handler auto-toggles it on/off so you don't have to remember.

let enabled = false;
let message =
  'The site is temporarily unavailable while a load test is in progress.';
let enabledAt = null;

// Set of currently-active diagnostic run IDs. The server.js maintenance
// middleware bypasses requests carrying an X-Diagnostic-Run: <id> header
// whose id is in this set, so the load test traffic spawned by the
// diagnostics router can reach the real /api/messages handler even while
// maintenance is on for everyone else. The diagnostics router adds and
// removes ids around each run.
const activeRunIds = new Set();

module.exports = {
  isEnabled() {
    return enabled;
  },
  getState() {
    return { enabled, message, enabledAt };
  },
  enable(reason) {
    enabled = true;
    if (reason) message = reason;
    enabledAt = Date.now();
    return { enabled, message, enabledAt };
  },
  disable() {
    enabled = false;
    enabledAt = null;
    return { enabled, message, enabledAt };
  },
  registerRunId(id) {
    if (id) activeRunIds.add(String(id));
  },
  unregisterRunId(id) {
    if (id) activeRunIds.delete(String(id));
  },
  isActiveRunId(id) {
    return id != null && activeRunIds.has(String(id));
  }
};
