const axios = require('axios');
const { performance } = require('perf_hooks');

const API_URL = 'http://localhost:8080';

// Performance measurement utility
class PerformanceTest {
    constructor() {
        this.results = [];
    }

    async measureOperation(name, operation) {
        const start = performance.now();
        try {
            const result = await operation();
            const end = performance.now();
            const duration = end - start;
            
            this.results.push({
                operation: name,
                duration: Math.round(duration),
                status: 'SUCCESS',
                timestamp: new Date().toISOString()
            });
            
            console.log(`✅ ${name}: ${Math.round(duration)}ms`);
            return result;
        } catch (error) {
            const end = performance.now();
            const duration = end - start;
            
            this.results.push({
                operation: name,
                duration: Math.round(duration),
                status: 'ERROR',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            console.log(`❌ ${name}: ${Math.round(duration)}ms - ERROR: ${error.message}`);
            throw error;
        }
    }

    printSummary() {
        console.log('\n📊 PERFORMANCE SUMMARY');
        console.log('='.repeat(50));
        
        const successful = this.results.filter(r => r.status === 'SUCCESS');
        const failed = this.results.filter(r => r.status === 'ERROR');
        
        console.log(`Total Operations: ${this.results.length}`);
        console.log(`Successful: ${successful.length}`);
        console.log(`Failed: ${failed.length}`);
        
        if (successful.length > 0) {
            console.log('\nSuccessful Operations:');
            successful.forEach(r => {
                console.log(`  ${r.operation}: ${r.duration}ms`);
            });
            
            const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
            console.log(`\nAverage Response Time: ${Math.round(avgDuration)}ms`);
        }
        
        if (failed.length > 0) {
            console.log('\nFailed Operations:');
            failed.forEach(r => {
                console.log(`  ${r.operation}: ${r.duration}ms - ${r.error}`);
            });
        }
    }
}

// Mock authentication for testing
async function mockLogin() {
    try {
        return await axios.post(`${API_URL}/login`, {
            email: 'test@test.com',
            password: 'test123'
        }, {
            withCredentials: true
        });
    } catch (error) {
        // If login fails, we'll test without authentication
        console.log('⚠️  Login failed, testing without authentication');
        return null;
    }
}

// Test database connection
async function testDatabaseConnection() {
    const response = await axios.get(`${API_URL}/test-db`);
    return response.data;
}

// Test conversations endpoint
async function testGetConversations() {
    const response = await axios.get(`${API_URL}/conversations`, {
        withCredentials: true
    });
    return response.data;
}

// Test messages endpoint
async function testGetMessages() {
    const response = await axios.get(`${API_URL}/messages/test-conversation-id`, {
        withCredentials: true
    });
    return response.data;
}

// Test current user endpoint
async function testGetCurrentUser() {
    const response = await axios.get(`${API_URL}/user/current`, {
        withCredentials: true
    });
    return response.data;
}

// Main performance test
async function runPerformanceTest() {
    console.log('🚀 Starting Messaging System Performance Test\n');
    
    const test = new PerformanceTest();
    
    try {
        // Test 1: Database Connection
        await test.measureOperation('Database Connection', testDatabaseConnection);
        
        // Test 2: Mock Login (if possible)
        await test.measureOperation('User Login', mockLogin);
        
        // Test 3: Get Current User
        try {
            await test.measureOperation('Get Current User', testGetCurrentUser);
        } catch (error) {
            console.log('⚠️  Authentication required for user endpoints');
        }
        
        // Test 4: Get Conversations
        try {
            await test.measureOperation('Get Conversations', testGetConversations);
        } catch (error) {
            console.log('⚠️  Authentication required for conversations');
        }
        
        // Test 5: Get Messages
        try {
            await test.measureOperation('Get Messages', testGetMessages);
        } catch (error) {
            console.log('⚠️  Authentication required for messages');
        }
        
        // Test multiple rapid requests to simulate real usage
        console.log('\n🔄 Testing Rapid Sequential Requests...');
        
        const rapidTests = [];
        for (let i = 0; i < 5; i++) {
            rapidTests.push(
                test.measureOperation(`Database Check #${i + 1}`, testDatabaseConnection)
            );
        }
        
        await Promise.all(rapidTests);
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
    
    test.printSummary();
    
    // Provide performance analysis
    console.log('\n🔍 PERFORMANCE ANALYSIS');
    console.log('='.repeat(50));
    
    const dbTests = test.results.filter(r => r.operation.includes('Database'));
    if (dbTests.length > 0) {
        const avgDbTime = dbTests.reduce((sum, r) => sum + r.duration, 0) / dbTests.length;
        console.log(`Average Database Response: ${Math.round(avgDbTime)}ms`);
        
        if (avgDbTime > 100) {
            console.log('⚠️  Database responses are slow (>100ms)');
            console.log('   Consider: Connection pooling, query optimization, indexes');
        } else if (avgDbTime > 50) {
            console.log('⚠️  Database responses are moderate (>50ms)');
            console.log('   Consider: Adding caching, query optimization');
        } else {
            console.log('✅ Database responses are fast (<50ms)');
        }
    }
    
    console.log('\n📋 RECOMMENDATIONS:');
    const authErrors = test.results.filter(r => r.error && r.error.includes('401'));
    if (authErrors.length > 0) {
        console.log('🔐 AUTHENTICATION ISSUE DETECTED:');
        console.log('   1. Session cookies not being sent properly');
        console.log('   2. CORS configuration needs adjustment');
        console.log('   3. Session configuration problems');
        console.log('   → Fix authentication first for accurate performance testing');
    }
}

// Run the test
if (require.main === module) {
    runPerformanceTest().catch(console.error);
}

module.exports = { runPerformanceTest, PerformanceTest }; 