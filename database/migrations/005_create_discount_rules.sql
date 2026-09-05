CREATE TABLE IF NOT EXISTS discount_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_tier ENUM('BRONZE', 'SILVER', 'GOLD', 'ENTERPRISE') NOT NULL,
  product_category ENUM('Hardware', 'Services', 'Subscriptions') NOT NULL,
  max_discount_pct DECIMAL(5, 2) NOT NULL,
  required_approval_level ENUM('SALES_REP', 'SALES_MANAGER', 'FINANCE') NOT NULL DEFAULT 'SALES_MANAGER',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_tier_cat (customer_tier, product_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
