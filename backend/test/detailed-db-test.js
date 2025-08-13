const { Pool } = require('pg');
const { performance } = require('perf_hooks');

// Load environment variables FIRST
require('dotenv').config();

// Test with same config as your app
const poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false,
    max: 25,
    min: 5,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 5000,
    acquireTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
};

console.log('🔧 POOL CONFIG:', JSON.stringify(poolConfig, null, 2));
const pool = new Pool(poolConfig);

async function measureQuery(name, queryText, params = []) {
    const start = performance.now();
    let client;
    
    try {
        // Measure connection acquisition
        const connStart = performance.now();
        client = await pool.connect();
        const connTime = performance.now() - connStart;
        
        // Measure query execution
        const queryStart = performance.now();
        const result = await client.query(queryText, params);
        const queryTime = performance.now() - queryStart;
        
        const totalTime = performance.now() - start;
        
        console.log(`📊 ${name}:`);
        console.log(`   Connection: ${Math.round(connTime)}ms`);
        console.log(`   Query: ${Math.round(queryTime)}ms`);
        console.log(`   Total: ${Math.round(totalTime)}ms`);
        console.log(`   Rows: ${result.rowCount}`);
        
        return {
            name,
            connectionTime: connTime,
            queryTime,
            totalTime,
            rowCount: result.rowCount
        };
        
    } catch (error) {
        const totalTime = performance.now() - start;
        console.log(`❌ ${name}: ${Math.round(totalTime)}ms - ERROR: ${error.message}`);
        throw error;
    } finally {
        if (client) client.release();
    }
}

async function testDatabasePerformance() {
    console.log('🔍 DETAILED DATABASE PERFORMANCE TEST');
    console.log('=====================================\n');
    
    const results = [];
    
    try {
        // Test 1: Simple connection test
        console.log('1️⃣ Testing Basic Connection...');
        const test1 = await measureQuery(
            'Simple SELECT NOW()',
            'SELECT NOW() as current_time'
        );
        results.push(test1);
        
        // Test 2: Pool status before load
        console.log('\n2️⃣ Pool Status:');
        console.log(`   Total connections: ${pool.totalCount}`);
        console.log(`   Idle connections: ${pool.idleCount}`);
        console.log(`   Waiting requests: ${pool.waitingCount}`);
        
        // Test 3: Simple table query
        console.log('\n3️⃣ Testing Simple Table Query...');
        const test3 = await measureQuery(
            'Users Count',
            'SELECT COUNT(*) FROM users WHERE is_active = true'
        );
        results.push(test3);
        
        // Test 4: More complex query (like your conversations query)
        console.log('\n4️⃣ Testing Complex Conversations Query...');
        const test4 = await measureQuery(
            'Conversations Query',
            `SELECT 
                c.id,
                c.last_message_at,
                c.created_at,
                u1.first_name || ' ' || u1.last_name as participant1_name,
                u2.first_name || ' ' || u2.last_name as participant2_name
             FROM conversations c
             JOIN users u1 ON c.participant1_id = u1.id
             JOIN users u2 ON c.participant2_id = u2.id
             WHERE c.is_active = true
             ORDER BY c.last_message_at DESC
             LIMIT 10`
        );
        results.push(test4);
        
        // Test 5: Rapid consecutive queries (like your frontend does)
        console.log('\n5️⃣ Testing Rapid Consecutive Queries...');
        const rapidStart = performance.now();
        
        const rapidPromises = [];
        for (let i = 0; i < 5; i++) {
            rapidPromises.push(
                measureQuery(`Rapid Query ${i + 1}`, 'SELECT NOW()').catch(err => ({
                    name: `Rapid Query ${i + 1}`,
                    error: err.message,
                    totalTime: 0
                }))
            );
        }
        
        const rapidResults = await Promise.all(rapidPromises);
        const rapidTotalTime = performance.now() - rapidStart;
        
        console.log(`\n   Rapid Test Total Time: ${Math.round(rapidTotalTime)}ms`);
        results.push(...rapidResults);
        
        // Test 6: Connection pool stress test
        console.log('\n6️⃣ Pool Status After Load:');
        console.log(`   Total connections: ${pool.totalCount}`);
        console.log(`   Idle connections: ${pool.idleCount}`);
        console.log(`   Waiting requests: ${pool.waitingCount}`);
        
    } catch (error) {
        console.error('Test failed:', error);
    }
    
    // Analysis
    console.log('\n📈 PERFORMANCE ANALYSIS');
    console.log('========================');
    
    const successfulResults = results.filter(r => !r.error);
    
    if (successfulResults.length > 0) {
        const avgConnection = successfulResults.reduce((sum, r) => sum + (r.connectionTime || 0), 0) / successfulResults.length;
        const avgQuery = successfulResults.reduce((sum, r) => sum + (r.queryTime || 0), 0) / successfulResults.length;
        const avgTotal = successfulResults.reduce((sum, r) => sum + r.totalTime, 0) / successfulResults.length;
        
        console.log(`Average Connection Time: ${Math.round(avgConnection)}ms`);
        console.log(`Average Query Time: ${Math.round(avgQuery)}ms`);
        console.log(`Average Total Time: ${Math.round(avgTotal)}ms`);
        
        console.log('\n🔍 BOTTLENECK ANALYSIS:');
        
        if (avgConnection > avgQuery * 2) {
            console.log('🚨 CONNECTION ESTABLISHMENT is the bottleneck!');
            console.log('   - Network latency + SSL handshake taking too long');
            console.log('   - Consider: Connection pooling, persistent connections');
        } else if (avgQuery > avgConnection * 2) {
            console.log('🚨 QUERY EXECUTION is the bottleneck!');
            console.log('   - Database queries are slow');
            console.log('   - Consider: Query optimization, indexes, smaller result sets');
        } else {
            console.log('⚖️  Balanced load between connection and query time');
        }
        
        if (avgTotal > 500) {
            console.log('🚨 OVERALL PERFORMANCE is poor (>500ms)');
            console.log('   - Consider local development database');
            console.log('   - Consider aggressive caching');
        }
    }
    
    await pool.end();
}

// Debug connection config
console.log('🔧 DATABASE CONNECTION CONFIG:');
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   Port: ${process.env.DB_PORT}`);
console.log(`   Database: ${process.env.DB_NAME}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   SSL: ${process.env.DB_SSL}`);
console.log('');

// Run the test
testDatabasePerformance().catch(console.error); 