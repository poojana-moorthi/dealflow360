const { query } = require('../config/db');

async function getNotifications(req, res, next) {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    const notifications = await query(
      `SELECT * FROM notifications
       WHERE (user_id = ? OR role = ? OR (user_id IS NULL AND role IS NULL))
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId, userRole]
    );

    res.json({
      success: true,
      message: 'Notifications retrieved',
      data: notifications
    });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    await query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markAsRead
};
