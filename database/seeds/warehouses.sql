INSERT INTO warehouses (id, name, code, location, priority, is_active)
VALUES
(1, 'Chennai Main Warehouse', 'WH-MAA', 'Ambattur Industrial Estate, Chennai', 1, TRUE),
(2, 'Bangalore Warehouse', 'WH-BLR', 'Whitefield Logistics Hub, Bangalore', 2, TRUE),
(3, 'Mumbai Warehouse', 'WH-BOM', 'Bhiwandi Warehousing Complex, Mumbai', 3, TRUE),
(4, 'Hyderabad Warehouse', 'WH-HYD', 'Medchal Logistics Park, Hyderabad', 4, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), priority=VALUES(priority), location=VALUES(location);
