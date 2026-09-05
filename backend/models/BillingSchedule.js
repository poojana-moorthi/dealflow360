const { query } = require('../config/db');

class BillingSchedule {
  static async findBySubscriptionId(subscriptionId) {
    return await query(
      `SELECT bs.*, i.invoice_number
       FROM billing_schedules bs
       LEFT JOIN invoices i ON bs.invoice_id = i.id
       WHERE bs.subscription_id = ?
       ORDER BY bs.schedule_date ASC`,
      [subscriptionId]
    );
  }

  static async findByQuotationId(quotationId) {
    return await query(
      `SELECT bs.*, s.plan_name, s.frequency, i.invoice_number
       FROM billing_schedules bs
       JOIN subscriptions s ON bs.subscription_id = s.id
       LEFT JOIN invoices i ON bs.invoice_id = i.id
       WHERE bs.quotation_id = ?
       ORDER BY bs.schedule_date ASC`,
      [quotationId]
    );
  }

  static async create({ subscription_id, quotation_id, schedule_date, due_date, amount, status = 'SCHEDULED' }) {
    const result = await query(
      `INSERT INTO billing_schedules (subscription_id, quotation_id, schedule_date, due_date, amount, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [subscription_id, quotation_id, schedule_date, due_date, amount, status]
    );
    return result.insertId;
  }
}

module.exports = BillingSchedule;
