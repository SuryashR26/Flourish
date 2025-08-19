const { Pool } = require('pg');
require('dotenv').config();

// Optimized pool configuration for long-distance connections
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false,

    // 🔥 OPTIMIZED POOL SETTINGS FOR LONG-DISTANCE CONNECTIONS

    // Connection Pool Size
    max: 15,                    // Reduced max - quality over quantity
    min: 8,                     // Higher minimum - keep warm connections

    // Connection Lifecycle (MUCH longer for international connections)
    idleTimeoutMillis: 300000,  // 5 minutes (was 1 minute)
    connectionTimeoutMillis: 15000,  // 15 seconds (was 5 seconds)
    acquireTimeoutMillis: 20000,     // 20 seconds (was 10 seconds)

    // TCP Keep-Alive (Critical for long-distance)
    keepAlive: true,
    keepAliveInitialDelayMillis: 5000,  // Start keep-alive sooner

    // Query timeouts
    statement_timeout: 45000,   // 45 seconds (increased)
    query_timeout: 45000,

    // Application-level settings
    application_name: 'flourish_messaging_app',

    // Connection string options for better reliability
    options: '--application_name=flourish_app'
});

// Enhanced connection monitoring
pool.on('connect', (client) => {
    console.log('✅ New database connection established (ID: ' + client.processID + ')');

    // Set optimal connection settings for international latency
    client.query(`
        SET statement_timeout = '45s';
        SET lock_timeout = '30s';
        SET idle_in_transaction_session_timeout = '300s';
        SET tcp_keepalives_idle = '30';
        SET tcp_keepalives_interval = '10';
        SET tcp_keepalives_count = '3';
    `).catch(err => console.warn('Failed to set connection settings:', err));
});

pool.on('error', (err, client) => {
    console.error('❌ Database connection error:', {
        error: err.message,
        clientID: client?.processID || 'unknown',
        timestamp: new Date().toISOString()
    });
});

// Removed repetitive acquire/release logs for cleaner output
// pool.on('acquire', (client) => {
//     console.log('🔄 Connection acquired from pool (ID: ' + (client?.processID || 'unknown') + ')');
// });

// pool.on('release', (client) => {
//     console.log('↩️  Connection returned to pool (ID: ' + (client?.processID || 'unknown') + ')');
// });

pool.on('remove', (client) => {
    console.log('🗑️  Connection removed from pool (ID: ' + (client?.processID || 'unknown') + ')');
});

// Pool health monitoring (disabled for less verbose output)
// setInterval(() => {
//     console.log('📊 Pool Status:', {
//         total: pool.totalCount,
//         idle: pool.idleCount,
//         waiting: pool.waitingCount,
//         timestamp: new Date().toISOString()
//     });
// }, 30000); // Log every 30 seconds

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down database pool...');
    await pool.end();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down database pool...');
    await pool.end();
    process.exit(0);
});

module.exports = pool; 