-- Users Seed Data
-- Demo Password: Password123!
-- Hashed via bcrypt (10 rounds)
INSERT INTO users (id, name, email, password_hash, role, customer_id, phone, is_active)
VALUES
(1, 'Admin', 'admin@dealflow360.com', '$2a$10$LLkB9hl0wYA3H7GpFYN0vuf09VotEs9sCF3kE0hCgrtdPlMfd9b/y', 'ADMIN', NULL, '+91 9876543210', TRUE),
(2, 'Sales Rep', 'sales_rep@dealflow360.com', '$2a$10$LLkB9hl0wYA3H7GpFYN0vuf09VotEs9sCF3kE0hCgrtdPlMfd9b/y', 'SALES_REP', NULL, '+91 9876543211', TRUE),
(3, 'Sales Manager', 'sales_manager@dealflow360.com', '$2a$10$LLkB9hl0wYA3H7GpFYN0vuf09VotEs9sCF3kE0hCgrtdPlMfd9b/y', 'SALES_MANAGER', NULL, '+91 9876543212', TRUE),
(4, 'Finance', 'finance@dealflow360.com', '$2a$10$LLkB9hl0wYA3H7GpFYN0vuf09VotEs9sCF3kE0hCgrtdPlMfd9b/y', 'FINANCE', NULL, '+91 9876543213', TRUE),
(5, 'Operations', 'operations@dealflow360.com', '$2a$10$LLkB9hl0wYA3H7GpFYN0vuf09VotEs9sCF3kE0hCgrtdPlMfd9b/y', 'OPERATIONS', NULL, '+91 9876543214', TRUE),
(6, 'Customer 1', 'customer1@dealflow360.com', '$2a$10$LLkB9hl0wYA3H7GpFYN0vuf09VotEs9sCF3kE0hCgrtdPlMfd9b/y', 'CUSTOMER', 1, '+91 9876543215', TRUE),
(7, 'Customer 2', 'customer2@dealflow360.com', '$2a$10$LLkB9hl0wYA3H7GpFYN0vuf09VotEs9sCF3kE0hCgrtdPlMfd9b/y', 'CUSTOMER', 2, '+91 9876543216', TRUE),
(8, 'Customer 3', 'customer3@dealflow360.com', '$2a$10$LLkB9hl0wYA3H7GpFYN0vuf09VotEs9sCF3kE0hCgrtdPlMfd9b/y', 'CUSTOMER', 3, '+91 9876543217', TRUE),
(9, 'Customer 4', 'customer4@dealflow360.com', '$2a$10$LLkB9hl0wYA3H7GpFYN0vuf09VotEs9sCF3kE0hCgrtdPlMfd9b/y', 'CUSTOMER', 4, '+91 9876543218', TRUE),
(10, 'Customer 5', 'customer5@dealflow360.com', '$2a$10$LLkB9hl0wYA3H7GpFYN0vuf09VotEs9sCF3kE0hCgrtdPlMfd9b/y', 'CUSTOMER', 5, '+91 9876543219', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password_hash=VALUES(password_hash), role=VALUES(role), customer_id=VALUES(customer_id);
