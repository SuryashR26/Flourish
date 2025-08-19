const pool = require('./dB');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Running settings migration...');
        
        // Read the migration SQL
        const migrationSQL = fs.readFileSync(path.join(__dirname, 'settings_migration.sql'), 'utf8');
        
        // Execute the migration
        await pool.query(migrationSQL);
        
        console.log('✅ Settings migration completed successfully!');
        console.log('Added columns: display_name, bio, profile_visibility, show_email_publicly');
        
        // Test that the columns were added by querying the table structure
        const result = await pool.query(`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('display_name', 'bio', 'profile_visibility', 'show_email_publicly')
            ORDER BY column_name;
        `);
        
        console.log('\n📋 Newly added columns:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type}) ${row.column_default ? `default: ${row.column_default}` : ''}`);
        });
        
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️  Migration columns already exist - skipping');
        } else {
            console.error('❌ Migration failed:', error.message);
            throw error;
        }
    } finally {
        await pool.end();
    }
}

// Run the migration
runMigration().catch(console.error);
