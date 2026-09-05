INSERT INTO customers (id, company_name, contact_name, email, phone, tier, address, city, state, country, status)
VALUES
(1, 'Acme Corporation', 'Johnathan Acme', 'customer@acme.com', '+91 44 2828 9001', 'ENTERPRISE', '124 Nelson Manickam Road', 'Chennai', 'Tamil Nadu', 'India', 'ACTIVE'),
(2, 'Beta Industries', 'Sunil Narang', 'procurement@betaind.com', '+91 80 4112 5500', 'GOLD', '88 Electronic City Phase 1', 'Bangalore', 'Karnataka', 'India', 'ACTIVE'),
(3, 'Nova Retail Ltd', 'Meera Kapoor', 'contact@novaretail.in', '+91 22 6789 1234', 'SILVER', '45 Nariman Point', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
(4, 'GreenTech Solutions', 'Karthik Raja', 'admin@greentech.org', '+91 40 2345 6789', 'BRONZE', '12 HITEC City', 'Hyderabad', 'Telangana', 'India', 'ACTIVE'),
(5, 'Prime Logistics', 'Amitabh Verma', 'orders@primelogistics.in', '+91 11 2654 9988', 'ENTERPRISE', '56 Connaught Place', 'New Delhi', 'Delhi', 'India', 'ACTIVE')
ON DUPLICATE KEY UPDATE company_name=VALUES(company_name), contact_name=VALUES(contact_name), tier=VALUES(tier);
