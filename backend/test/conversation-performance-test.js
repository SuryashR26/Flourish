require('dotenv').config();
const axios = require('axios');
const { performance } = require('perf_hooks');

const API_URL = 'http://localhost:8080';

async function testConversationLoading() {
    console.log('🔍 CONVERSATION LOADING PERFORMANCE TEST');
    console.log('========================================\n');
    
    try {
        // Test conversation loading multiple times
        const results = [];
        
        for (let i = 1; i <= 5; i++) {
            console.log(`📊 Test ${i}/5: Loading conversations...`);
            
            const start = performance.now();
            
            try {
                const response = await axios.get(`${API_URL}/conversations`, {
                    withCredentials: true,
                    timeout: 10000 // 10 second timeout
                });
                
                const end = performance.now();
                const duration = Math.round(end - start);
                
                console.log(`   ✅ Success: ${duration}ms (${response.data.conversations?.length || 0} conversations)`);
                
                results.push({
                    test: i,
                    duration,
                    success: true,
                    conversationCount: response.data.conversations?.length || 0
                });
                
                // Wait 1 second between tests
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                const end = performance.now();
                const duration = Math.round(end - start);
                
                console.log(`   ❌ Error: ${duration}ms - ${error.message}`);
                
                results.push({
                    test: i,
                    duration,
                    success: false,
                    error: error.message
                });
            }
        }
        
        // Analysis
        console.log('\n📈 PERFORMANCE ANALYSIS');
        console.log('========================');
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log(`Total Tests: ${results.length}`);
        console.log(`Successful: ${successful.length}`);
        console.log(`Failed: ${failed.length}`);
        
        if (successful.length > 0) {
            const times = successful.map(r => r.duration);
            const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            
            console.log(`\nSuccessful Tests:`);
            successful.forEach(r => {
                console.log(`  Test ${r.test}: ${r.duration}ms (${r.conversationCount} conversations)`);
            });
            
            console.log(`\nPerformance Summary:`);
            console.log(`  Average: ${Math.round(avgTime)}ms`);
            console.log(`  Fastest: ${minTime}ms`);
            console.log(`  Slowest: ${maxTime}ms`);
            
            // Performance evaluation
            console.log(`\n🎯 PERFORMANCE RATING:`);
            if (avgTime < 500) {
                console.log(`  🟢 EXCELLENT (${Math.round(avgTime)}ms average)`);
                console.log(`     Users will experience snappy conversation switching`);
            } else if (avgTime < 1000) {
                console.log(`  🟡 GOOD (${Math.round(avgTime)}ms average)`);
                console.log(`     Acceptable performance for most users`);
            } else if (avgTime < 2000) {
                console.log(`  🟠 SLOW (${Math.round(avgTime)}ms average)`);
                console.log(`     Users may notice delays when switching conversations`);
            } else {
                console.log(`  🔴 VERY SLOW (${Math.round(avgTime)}ms average)`);
                console.log(`     Poor user experience - needs optimization`);
            }
            
            // Improvement calculation (assuming previous N+1 performance)
            const estimatedOldPerformance = successful[0]?.conversationCount * 600 + 300; // N*600ms + base query
            if (estimatedOldPerformance > avgTime) {
                const improvement = ((estimatedOldPerformance - avgTime) / estimatedOldPerformance * 100);
                console.log(`\n🚀 ESTIMATED IMPROVEMENT:`);
                console.log(`  Before (N+1 queries): ~${estimatedOldPerformance}ms`);
                console.log(`  After (optimized): ${Math.round(avgTime)}ms`);
                console.log(`  Improvement: ${Math.round(improvement)}% faster`);
            }
        }
        
        if (failed.length > 0) {
            console.log(`\n❌ Failed Tests:`);
            failed.forEach(r => {
                console.log(`  Test ${r.test}: ${r.duration}ms - ${r.error}`);
            });
            
            if (failed.some(r => r.error.includes('401') || r.error.includes('Unauthorized'))) {
                console.log(`\n🔐 AUTHENTICATION ISSUE DETECTED:`);
                console.log(`     You need to be logged in to test conversation loading`);
                console.log(`     1. Go to http://localhost:3000/login`);
                console.log(`     2. Log in with your credentials`);
                console.log(`     3. Run this test again`);
            }
        }
        
    } catch (error) {
        console.error('Test setup failed:', error.message);
    }
}

// Run the test
testConversationLoading().catch(console.error); 