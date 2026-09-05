const { query } = require('../config/db');

class Invoice {
  static async findAll({ customerId } = {}) {
    let sql = `
      SELECT i.*, c.company_name as customer_name, q.quotation_number
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      JOIN quotations q ON i.quotation_id = q.id
      WHERE 1=1
    `;
    const params = [];
    if (customerId) {
      sql += ' AND i.customer_id = ?';
      params.push(customerId);
    }
    sql += ' ORDER BY i.created_at DESC';
    return await query(sql, params);
  }

  static async findById(id) {
    const invoices = await query(
      `SELECT i.*, c.company_name as customer_name, c.contact_name, c.email as customer_email,
              c.phone as customer_phone, c.address as customer_address, c.city as customer_city,
              q.quotation_number
       FROM invoices i
       JOIN customers c ON i.customer_id = c.id
       JOIN quotations q ON i.quotation_id = q.id
       WHERE i.id = ?`,
      [id]
    );
    if (invoices.length === 0) return null;
    const inv = invoices[0];

    inv.items = await query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
    inv.payments = await query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC', [id]);
    return inv;
  }

  static async create(data) {
    const {
      invoice_number, customer_id, quotation_id,
      invoice_date, due_date, subtotal, discount = 0, tax = 0, total,
      status = 'SENT', payment_status = 'UNPAID'
    } = data;

    const result = await query(
      `INSERT INTO invoices (
        invoice_number, customer_id, quotation_id,
        invoice_date, due_date, subtotal, discount, tax, total,
        amount_paid, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, ?, ?)`,
      [invoice_number, customer_id, quotation_id, invoice_date, due_date, subtotal, discount, tax, total, status, payment_status]
    );
    return result.insertId;
  }

  static async addItem(data) {
    const { invoice_id, product_id, description, quantity, unit_price, line_total, billing_type } = data;
    await query(
      `INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, line_total, billing_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoice_id, product_id || null, description, quantity, unit_price, line_total, billing_type || 'ONE_TIME']
    );
  }

  static async updatePaymentStatus(id, newPaymentAmount) {
    const inv = await this.findById(id);
    if (!inv) return null;

    const totalPaid = parseFloat(inv.amount_paid) + parseFloat(newPaymentAmount);
    let paymentStatus = 'UNPAID';
    let invoiceStatus = inv.status;

    if (totalPaid >= parseFloat(inv.total)) {
      paymentStatus = 'PAID';
      invoiceStatus = 'PAID';
    } else if (totalPaid > 0) {
      paymentStatus = 'PARTIALLY_PAID';
      invoiceStatus = 'PARTIALLY_PAID';
    }

    await query(
      'UPDATE invoices SET amount_paid = ?, payment_status = ?, status = ? WHERE id = ?',
      [totalPaid, paymentStatus, invoiceStatus, id]
    );

    return this.findById(id);
  }
}

module.exports = Invoice;
