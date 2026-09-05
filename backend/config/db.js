const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'dealflow360',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true
});

// Helper for executing queries with parameters
async function query(sql, params = []) {
  const [results] = await pool.query(sql, params);
  return results;
}

// Helper to get a transaction connection
async function getConnection() {
  return await pool.getConnection();
}

module.exports = {
  pool,
  query,
  getConnection
};
