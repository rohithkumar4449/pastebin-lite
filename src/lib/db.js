/**
 * Database Connection Module - MySQL with mysql2
 *
 * Direct MySQL connection without Prisma
 * Uses connection pooling for serverless environments
 */

import mysql from "mysql2/promise";

// Parse database URL or use individual environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Accept self-signed certificates from Aiven
  },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 30000, // 30 second timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

console.log("DB Config:", {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
});

// Create connection pool (singleton pattern)
const globalForDb = globalThis;
const pool = globalForDb.mysqlPool ?? mysql.createPool(dbConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = pool;
}

// Initialize database table
export async function initDatabase() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS pastes (
        id VARCHAR(21) PRIMARY KEY,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NULL,
        max_views INT NULL,
        view_count INT DEFAULT 0,
        INDEX idx_expires_at (expires_at)
      )
    `);
    console.log("Database table initialized");
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}

// Check database health
export async function checkHealth() {
  try {
    await pool.execute("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Create a new paste
export async function createPaste({ id, content, expiresAt, maxViews }) {
  await pool.execute(
    `INSERT INTO pastes (id, content, expires_at, max_views, view_count) 
     VALUES (?, ?, ?, ?, 0)`,
    [id, content, expiresAt || null, maxViews || null]
  );
  return { id, content, expiresAt, maxViews, viewCount: 0 };
}

// Get a paste by ID (without incrementing view count)
export async function getPaste(id) {
  const [rows] = await pool.execute(
    `SELECT id, content, created_at as createdAt, expires_at as expiresAt, 
            max_views as maxViews, view_count as viewCount 
     FROM pastes WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

// Increment view count atomically and return updated paste
export async function incrementViewCount(id) {
  // Increment view count
  await pool.execute(
    `UPDATE pastes SET view_count = view_count + 1 WHERE id = ?`,
    [id]
  );

  // Get updated paste
  const [rows] = await pool.execute(
    `SELECT id, content, created_at as createdAt, expires_at as expiresAt, 
            max_views as maxViews, view_count as viewCount 
     FROM pastes WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

// Delete a paste
export async function deletePaste(id) {
  await pool.execute(`DELETE FROM pastes WHERE id = ?`, [id]);
}

export default pool;
