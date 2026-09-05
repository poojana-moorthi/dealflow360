const { query } = require('../config/db');

class Payment {
  static async findByInvoiceId(invoiceId) {
    return await query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC', [invoiceId]);
  }

  static async create(data) {
    const { invoice_id, amount, payment_date, payment_method, transaction_reference, notes = '' } = data;
    const result = await query(
      `INSERT INTO payments (invoice_id, amount, payment_date, payment_method, transaction_reference, status, notes)
       VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?)`,
      [invoice_id, amount, payment_date || new Date(), payment_method, transaction_reference, notes]
    );
    return result.insertId;
  }
}

module.exports = Payment;
