const { Pool } = require('pg');
require('dotenv').config();

// Optimized pool configuration for messaging performance
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    },
    // Performance optimizations
    max: 25, // Increased pool size for concurrent users
    min: 5,  // Keep minimum connections open
    idleTimeoutMillis: 60000, // Keep connections longer (1 minute)
    connectionTimeoutMillis: 5000, // Faster timeout for quicker failures
    acquireTimeoutMillis: 10000, // Max time to wait for connection
    
    // Query performance settings
    statement_timeout: 30000, // 30 second query timeout
    query_timeout: 30000,
    
    // Connection optimization
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
});

// Connection event monitoring
pool.on('connect', (client) => {
    console.log('New database connection established');
    
    // Set optimal connection settings for messaging
    client.query(`
        SET statement_timeout = '30s';
        SET lock_timeout = '10s';
        SET idle_in_transaction_session_timeout = '60s';
    `).catch(err => console.warn('Failed to set connection settings:', err));
});

pool.on('error', (err, client) => {
    console.error('Unexpected database error:', err);
});

pool.on('acquire', () => {
    console.log('Database connection acquired from pool');
});

pool.on('remove', () => {
    console.log('Database connection removed from pool');
});

module.exports = pool;