INSERT INTO price_lists (product_id, customer_tier, price, currency, effective_date, is_active)
VALUES
-- Laptop Pro (Base 120000)
(1, 'BRONZE', 120000.00, 'INR', '2026-01-01', TRUE),
(1, 'SILVER', 115000.00, 'INR', '2026-01-01', TRUE),
(1, 'GOLD', 110000.00, 'INR', '2026-01-01', TRUE),
(1, 'ENTERPRISE', 105000.00, 'INR', '2026-01-01', TRUE),

-- Setup Service (Base 15000)
(2, 'BRONZE', 15000.00, 'INR', '2026-01-01', TRUE),
(2, 'SILVER', 14000.00, 'INR', '2026-01-01', TRUE),
(2, 'GOLD', 13000.00, 'INR', '2026-01-01', TRUE),
(2, 'ENTERPRISE', 12000.00, 'INR', '2026-01-01', TRUE),

-- Cloud Support (Base 18000)
(3, 'BRONZE', 18000.00, 'INR', '2026-01-01', TRUE),
(3, 'SILVER', 17000.00, 'INR', '2026-01-01', TRUE),
(3, 'GOLD', 16000.00, 'INR', '2026-01-01', TRUE),
(3, 'ENTERPRISE', 15000.00, 'INR', '2026-01-01', TRUE),

-- Extended Warranty (Base 12000)
(4, 'BRONZE', 12000.00, 'INR', '2026-01-01', TRUE),
(4, 'SILVER', 11500.00, 'INR', '2026-01-01', TRUE),
(4, 'GOLD', 11000.00, 'INR', '2026-01-01', TRUE),
(4, 'ENTERPRISE', 10000.00, 'INR', '2026-01-01', TRUE),

-- Installation Package (Base 25000)
(5, 'BRONZE', 25000.00, 'INR', '2026-01-01', TRUE),
(5, 'SILVER', 23500.00, 'INR', '2026-01-01', TRUE),
(5, 'GOLD', 22000.00, 'INR', '2026-01-01', TRUE),
(5, 'ENTERPRISE', 20000.00, 'INR', '2026-01-01', TRUE),

-- Enterprise Analytics (Base 35000)
(6, 'BRONZE', 35000.00, 'INR', '2026-01-01', TRUE),
(6, 'SILVER', 33000.00, 'INR', '2026-01-01', TRUE),
(6, 'GOLD', 31000.00, 'INR', '2026-01-01', TRUE),
(6, 'ENTERPRISE', 29000.00, 'INR', '2026-01-01', TRUE)
ON DUPLICATE KEY UPDATE price=VALUES(price), is_active=VALUES(is_active);
