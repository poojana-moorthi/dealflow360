INSERT INTO discount_rules (customer_tier, product_category, max_discount_pct, required_approval_level)
VALUES
-- Bronze
('BRONZE', 'Hardware', 5.00, 'SALES_MANAGER'),
('BRONZE', 'Services', 5.00, 'SALES_MANAGER'),
('BRONZE', 'Subscriptions', 5.00, 'SALES_MANAGER'),

-- Silver
('SILVER', 'Hardware', 10.00, 'SALES_MANAGER'),
('SILVER', 'Services', 10.00, 'SALES_MANAGER'),
('SILVER', 'Subscriptions', 10.00, 'SALES_MANAGER'),

-- Gold
('GOLD', 'Hardware', 15.00, 'SALES_MANAGER'),
('GOLD', 'Services', 10.00, 'SALES_MANAGER'),
('GOLD', 'Subscriptions', 10.00, 'SALES_MANAGER'),

-- Enterprise
('ENTERPRISE', 'Hardware', 15.00, 'SALES_MANAGER'),
('ENTERPRISE', 'Services', 10.00, 'SALES_MANAGER'),
('ENTERPRISE', 'Subscriptions', 10.00, 'SALES_MANAGER')
ON DUPLICATE KEY UPDATE max_discount_pct=VALUES(max_discount_pct), required_approval_level=VALUES(required_approval_level);
