-- Subscriptions and Billing Schedules Seed Data
INSERT INTO subscriptions (
  id, subscription_number, customer_id, quotation_id, product_id,
  plan_name, frequency, unit_price, quantity, subtotal,
  start_date, next_billing_date, status
)
VALUES
(
  1, 'SUB-2026-001', 3, 3, 3,
  'Cloud Support Premium', 'MONTHLY', 18000.00, 1, 18000.00,
  '2026-03-01', '2026-04-01', 'ACTIVE'
)
ON DUPLICATE KEY UPDATE subscription_number=VALUES(subscription_number), status=VALUES(status);

INSERT INTO billing_schedules (
  id, subscription_id, quotation_id, schedule_date, due_date, amount, status
)
VALUES
(1, 1, 3, '2026-03-01', '2026-03-15', 18000.00, 'INVOICED'),
(2, 1, 3, '2026-04-01', '2026-04-15', 18000.00, 'SCHEDULED'),
(3, 1, 3, '2026-05-01', '2026-05-15', 18000.00, 'SCHEDULED')
ON DUPLICATE KEY UPDATE status=VALUES(status);
