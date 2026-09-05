-- Demo Quotations
-- Quotation DF360-1001: Acme Corporation (Enterprise) - Sathish Kumar
INSERT INTO quotations (
  id, quotation_number, customer_id, user_id, status,
  subtotal, total_discount, tax_amount, total_amount, total_cost,
  gross_profit, gross_margin_pct, risk_score, risk_level,
  approval_required, required_approval_level, risk_reasons, notes, valid_until
)
VALUES
(
  1, 'DF360-1001', 1, 2, 'DRAFT',
  633000.00, 74700.00, 100494.00, 658794.00, 459000.00,
  174000.00, 27.49, 78, 'HIGH',
  TRUE, 'SALES_MANAGER',
  JSON_ARRAY(
    'Services category discount limit is 10.0%, requested 18.0% (violation: +8.0%)',
    'Gross margin is 27.49%, which is below target threshold of 30.0%',
    'High value deal (₹6,58,794) with multi-line discount exceptions'
  ),
  'Strategic expansion quote for Acme Corp Q3 tech refresh',
  DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)
),
(
  2, 'DF360-1002', 2, 2, 'APPROVED',
  230000.00, 15000.00, 38700.00, 253700.00, 180000.00,
  35000.00, 16.28, 42, 'MEDIUM',
  FALSE, 'NONE',
  JSON_ARRAY('Standard Gold tier discount applied within limits'),
  'Hardware upgrade for Beta Industries plant automation',
  DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY)
),
(
  3, 'DF360-1003', 3, 2, 'CONFIRMED',
  140000.00, 7000.00, 23940.00, 156940.00, 95000.00,
  38000.00, 28.57, 18, 'LOW',
  FALSE, 'NONE',
  JSON_ARRAY('All discount limits respected'),
  'Nova Retail annual support contract',
  DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY)
)
ON DUPLICATE KEY UPDATE quotation_number=VALUES(quotation_number), status=VALUES(status), subtotal=VALUES(subtotal), total_amount=VALUES(total_amount);

-- Quotation Items for DF360-1001 (Demo Scenario)
-- Items: 5x Laptop Pro (Hardware), 1x Setup Service (Services), 1x Cloud Support (Subscriptions)
INSERT INTO quotation_items (
  id, quotation_id, product_id, quantity, unit_price, unit_cost,
  discount_pct, discount_amount, line_total, line_margin_pct,
  billing_type, billing_frequency, risk_flag, risk_reason
)
VALUES
(1, 1, 1, 5, 120000.00, 90000.00, 12.00, 72000.00, 528000.00, 14.77, 'ONE_TIME', 'ONE_TIME', FALSE, NULL),
(2, 1, 2, 1, 15000.00, 5000.00, 18.00, 2700.00, 12300.00, 59.35, 'ONE_TIME', 'ONE_TIME', TRUE, 'Discount 18% exceeds category limit 10%'),
(3, 1, 3, 1, 18000.00, 4000.00, 0.00, 0.00, 18000.00, 77.78, 'RECURRING', 'MONTHLY', FALSE, NULL)
ON DUPLICATE KEY UPDATE quotation_id=VALUES(quotation_id), product_id=VALUES(product_id), quantity=VALUES(quantity);

-- Upsell Rules
INSERT INTO upsell_rules (id, trigger_product_id, recommended_product_id, reason, discount_incentive_pct, min_cart_value)
VALUES
(1, 3, 6, 'Customers subscribing to Cloud Support often achieve 40% faster ROI with Enterprise Analytics.', 5.00, 50000.00),
(2, 1, 4, 'Protect your hardware fleet with a 3-Year Extended Warranty covering accidental damage.', 10.00, 100000.00),
(3, 1, 2, 'Ensure zero downtime by bundling professional workstation imaging and installation.', 15.00, 50000.00)
ON DUPLICATE KEY UPDATE reason=VALUES(reason), discount_incentive_pct=VALUES(discount_incentive_pct);

-- Deal Health for DF360-1001
INSERT INTO deal_health (id, quotation_id, health_score, status, quotation_age_days, approval_delay_hours, discount_risk_level, fulfillment_risk_level, payment_status, reasons_json)
VALUES
(1, 1, 62, 'WATCH', 3, 14, 'HIGH', 'MEDIUM', 'NOT_INVOICED', JSON_ARRAY('Pending manager review on 8% service discount breach', 'Multi-warehouse split required across Chennai and Bangalore')),
(2, 2, 88, 'HEALTHY', 1, 2, 'LOW', 'LOW', 'NOT_INVOICED', JSON_ARRAY('Normal progression within SLA')),
(3, 3, 95, 'HEALTHY', 5, 0, 'LOW', 'LOW', 'INVOICED', JSON_ARRAY('Deal closed on time, initial invoice issued'))
ON DUPLICATE KEY UPDATE health_score=VALUES(health_score), status=VALUES(status);

-- Anomalies
INSERT INTO anomalies (id, quotation_id, anomaly_type, severity, description, detected_at, resolved)
VALUES
(1, 1, 'UNUSUAL_DISCOUNT', 'HIGH', 'Setup Service discount of 18.0% is 80% higher than policy cap (10.0%).', NOW(), FALSE)
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Notifications
INSERT INTO notifications (id, user_id, role, title, message, link, is_read)
VALUES
(1, 3, 'SALES_MANAGER', 'Approval Required: DF360-1001', 'Quotation DF360-1001 for Acme Corporation requires manager approval due to 18% discount on Setup Service.', '/approvals/1', FALSE),
(2, 5, 'OPERATIONS', 'Warehouse Split Required', 'DF360-1001 requires 5 Laptop Pro units; allocation splits across Chennai (3) and Bangalore (2).', '/fulfillment/1', FALSE)
ON DUPLICATE KEY UPDATE title=VALUES(title);
