/**
 * DealFlow360 Database Initializer and Seeder
 * Connects to MySQL, executes schema DDL, and populates realistic demo data.
 */
const fs = require('fs');
const path = require('path');

// Support loading mysql2 and bcryptjs from backend/node_modules
const backendModules = path.resolve(__dirname, '../backend/node_modules');
if (fs.existsSync(backendModules) && !module.paths.includes(backendModules)) {
  module.paths.push(backendModules);
}

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Load environment from backend/.env if available
const envPath = path.resolve(__dirname, '../backend/.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  multipleStatements: true
};

async function initDatabase() {
  console.log('[DB-SETUP] Connecting to MySQL at ' + DB_CONFIG.host + ':' + DB_CONFIG.port + ' as ' + DB_CONFIG.user + '...');
  let connection;

  try {
    // Step 1: Connect without database to ensure database exists
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('[DB-SETUP] Connected to MySQL successfully.');

    await connection.query('CREATE DATABASE IF NOT EXISTS dealflow360 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    console.log('[DB-SETUP] Database `dealflow360` verified/created.');
    await connection.end();

    // Step 2: Connect to dealflow360 database
    connection = await mysql.createConnection({
      ...DB_CONFIG,
      database: process.env.DB_NAME || 'dealflow360'
    });

    // Step 3: Run schema.sql
    const schemaPath = path.resolve(__dirname, 'schema/schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('[DB-SETUP] Applying schema from schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await connection.query(schemaSql);
      console.log('[DB-SETUP] Schema applied successfully.');
    }

    // Step 4: Run Seeds
    console.log('[DB-SETUP] Seeding demo users with hashed password...');
    const demoPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(demoPassword, 10);

    // Insert Users
    const users = [
      [1, 'Admin User', 'admin@dealflow360.com', passwordHash, 'ADMIN', null, '+91 9876543210'],
      [2, 'Sathish Kumar', 'sathish@dealflow360.com', passwordHash, 'SALES_REP', null, '+91 9876543211'],
      [3, 'Rajesh Sharma', 'manager@dealflow360.com', passwordHash, 'SALES_MANAGER', null, '+91 9876543212'],
      [4, 'Priya Venkat', 'finance@dealflow360.com', passwordHash, 'FINANCE', null, '+91 9876543213'],
      [5, 'Anand Rangan', 'operations@dealflow360.com', passwordHash, 'OPERATIONS', null, '+91 9876543214'],
      [6, 'Johnathan Acme', 'customer@acme.com', passwordHash, 'CUSTOMER', 1, '+91 9876543215']
    ];

    for (const u of users) {
      await connection.query(
        `INSERT INTO users (id, name, email, password_hash, role, customer_id, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role), customer_id=VALUES(customer_id)`,
        u
      );
    }

    // Run remaining seed sql files
    const seedFiles = [
      'customers.sql',
      'products.sql',
      'price_lists.sql',
      'discount_rules.sql',
      'warehouses.sql',
      'inventory.sql',
      'quotations.sql',
      'subscriptions.sql',
      'invoices.sql'
    ];

    for (const file of seedFiles) {
      const filePath = path.resolve(__dirname, 'seeds', file);
      if (fs.existsSync(filePath)) {
        console.log(`[DB-SETUP] Executing seed: ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf-8');
        await connection.query(sql);
      }
    }

    // Step 5: Verify table counts
    const [tables] = await connection.query('SHOW TABLES;');
    console.log(`[DB-SETUP] Database setup complete. Total tables: ${tables.length}`);
    for (const row of tables) {
      const tableName = Object.values(row)[0];
      const [[{ count }]] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  - ${tableName}: ${count} rows`);
    }

    console.log('\n[DB-SETUP] SUCCESS! DealFlow360 database is ready with all demo data.');
    console.log('Demo Accounts (Password: Password123!):');
    console.log('  - ADMIN: admin@dealflow360.com');
    console.log('  - SALES REP: sathish@dealflow360.com');
    console.log('  - SALES MANAGER: manager@dealflow360.com');
    console.log('  - FINANCE: finance@dealflow360.com');
    console.log('  - OPERATIONS: operations@dealflow360.com');
    console.log('  - CUSTOMER: customer@acme.com');

  } catch (err) {
    console.error('[DB-SETUP] ERROR initializing database:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
