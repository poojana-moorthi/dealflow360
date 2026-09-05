INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity)
VALUES
-- Laptop Pro (Product 1): 3 in Chennai, 2 in Bangalore, 0 in Mumbai, 0 in Hyderabad
(1, 1, 3, 0),
(1, 2, 2, 0),
(1, 3, 0, 0),
(1, 4, 0, 0),

-- Setup Service & Cloud Support do not require physical stock, but records can exist or be NULL
-- Extended Warranty / Installation Package
(4, 1, 50, 0),
(4, 2, 50, 0),
(5, 1, 20, 0),
(5, 2, 20, 0)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity), reserved_quantity=VALUES(reserved_quantity);
