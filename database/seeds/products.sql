INSERT INTO products (id, name, sku, category, description, unit, price, cost, tax_rate, billing_type, is_active)
VALUES
(1, 'Laptop Pro', 'HW-LP-01', 'Hardware', 'High performance enterprise computing workstation laptop 16-inch', 'Unit', 120000.00, 90000.00, 18.00, 'ONE_TIME', TRUE),
(2, 'Setup Service', 'SV-STP-01', 'Services', 'Complete workstation setup, imaging, and security hardening', 'Service', 15000.00, 5000.00, 18.00, 'ONE_TIME', TRUE),
(3, 'Cloud Support', 'SB-CS-01', 'Subscriptions', '24/7 dedicated enterprise cloud SLA support and monitoring', 'Month', 18000.00, 4000.00, 18.00, 'RECURRING', TRUE),
(4, 'Extended Warranty', 'SV-EW-01', 'Services', '3-year comprehensive hardware replacement and accidental coverage', 'Year', 12000.00, 3000.00, 18.00, 'ONE_TIME', TRUE),
(5, 'Installation Package', 'SV-INS-01', 'Services', 'On-premise infrastructure deployment and network routing', 'Package', 25000.00, 10000.00, 18.00, 'ONE_TIME', TRUE),
(6, 'Enterprise Analytics', 'SB-EA-01', 'Subscriptions', 'AI-powered telemetry, predictive sales insights, and executive dashboards', 'Month', 35000.00, 8000.00, 18.00, 'RECURRING', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), cost=VALUES(cost), category=VALUES(category), billing_type=VALUES(billing_type);
