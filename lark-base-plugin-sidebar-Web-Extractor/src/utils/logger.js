/*
 * Lightweight in-memory logger for runtime observability
 */

const _logs = [];
const MAX_LOGS = 5000;

export function log(event, data = {}, level = 'info') {
  try {
    const entry = {
      ts: new Date().toISOString(),
      level,
      event,
      data,
    };
    _logs.push(entry);
    if (_logs.length > MAX_LOGS) {
      _logs.splice(0, _logs.length - MAX_LOGS);
    }
  } catch (_) {
    // noop
  }
}

export function error(event, err, data = {}) {
  const message = (err && err.message) ? err.message : String(err || 'Unknown error');
  log(event, { message, stack: err?.stack, ...data }, 'error');
}

export function getLogs() {
  return [..._logs];
}

export function clearLogs() {
  _logs.length = 0;
}