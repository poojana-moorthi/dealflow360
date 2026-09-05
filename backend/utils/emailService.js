const { query } = require('../config/db');

async function sendNotification({ userId = null, role = null, title, message, link = null }) {
  console.log(`[NOTIFICATION DISPATCH] [Role: ${role || 'ALL'}] ${title} - ${message}`);
  try {
    await query(
      `INSERT INTO notifications (user_id, role, title, message, link) VALUES (?, ?, ?, ?, ?)`,
      [userId, role, title, message, link]
    );
  } catch (err) {
    console.error('[NOTIFICATION ERROR]', err);
  }
}

module.exports = { sendNotification };
