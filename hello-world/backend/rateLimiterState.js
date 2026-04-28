// Single-purpose module: holds the runtime-mutable "rate limits disabled"
// flag that all four limiters in server.js consult through their `skip`
// callback.
//
// The initial value is read from the DISABLE_RATE_LIMITS env var at process
// startup, so existing CLI workflows keep working. The flag can also be
// flipped at runtime by the super-admin diagnostics endpoints — that's how
// the Diagnostics & Tests page lets you stress-test under both conditions
// without a pm2 restart between runs.
//
// State is in-memory only. On a process restart it reverts to whatever the
// env var says. That's deliberate: a permanent "limiter off" should be a
// conscious config change, not something a forgotten browser tab can leave
// the production server in.

let disabled = process.env.DISABLE_RATE_LIMITS === 'true';

module.exports = {
  isDisabled() {
    return disabled;
  },
  setDisabled(value) {
    disabled = !!value;
    return disabled;
  }
};
