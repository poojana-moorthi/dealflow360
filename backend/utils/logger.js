function logInfo(message, meta = {}) {
  console.log(`[INFO] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? meta : '');
}

function logError(message, err = {}) {
  console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, err.stack || err);
}

module.exports = {
  info: logInfo,
  error: logError
};
