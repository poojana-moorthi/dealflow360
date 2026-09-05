const { query } = require('../config/db');

async function logAudit({ user_id = null, role = null, action, entity, entity_id = null, reason = null, metadata = {} }) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, role, action, entity, entity_id, reason, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, role, action, entity, entity_id, reason, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('[AUDIT-LOG-ERROR]', err);
  }
}

module.exports = { logAudit };
