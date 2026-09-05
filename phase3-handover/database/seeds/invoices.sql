-- Invoices and Payments Seed Data
INSERT INTO invoices (
  id, invoice_number, customer_id, quotation_id,
  invoice_date, due_date, subtotal, discount, tax, total,
  amount_paid, status, payment_status
)
VALUES
(
  1, 'INV-1042', 3, 3,
  '2026-03-01', '2026-03-15', 140000.00, 7000.00, 23940.00, 156940.00,
  156940.00, 'PAID', 'PAID'
)
ON DUPLICATE KEY UPDATE invoice_number=VALUES(invoice_number), status=VALUES(status);

INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, line_total, billing_type)
VALUES
(1, 1, 3, 'Cloud Support - Initial Onboarding & Setup', 1, 140000.00, 140000.00, 'ONE_TIME')
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT INTO payments (id, invoice_id, amount, payment_date, payment_method, transaction_reference, status, notes)
VALUES
(1, 1, 156940.00, '2026-03-03', 'RTGS', 'RTGS/HDFC/20260303/99120', 'SUCCESS', 'Full invoice payment settled via RTGS')
ON DUPLICATE KEY UPDATE amount=VALUES(amount);
