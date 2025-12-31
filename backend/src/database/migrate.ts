import dotenv from 'dotenv';
dotenv.config();

if(!process.env.DB_HOST){
    throw new Error('DB_HOST is not set');
}

if(!process.env.DB_PORT){
    throw new Error('DB_PORT is not set');
}

if(!process.env.DB_USER){
    throw new Error('DB_USER is not set');
}

if(!process.env.DB_PASSWORD){
    throw new Error('DB_PASSWORD is not set');
}

if(!process.env.DB_NAME){
    throw new Error('DB_NAME is not set');
}

import fs from 'fs';
import path from 'path';
import pool from '../config/database';

/**
 * Smart Migration Runner
 * 
 * WHY? We need to run ALL migration files in order (001, 002, 003...)
 * 
 * The Logic:
 * 1. Read all .sql files from migrations directory
 * 2. Sort them alphabetically (001 comes before 002)
 * 3. Execute each migration in order
 * 4. If one fails, stop and report error
 */
async function executeMigrations() {
    try {
        console.log('🚀 Starting database migrations...');
        
        // Get migrations directory path
        const migrationsDir = path.join(__dirname, 'migrations');
        
        // Read all files from migrations directory
        const files = fs.readdirSync(migrationsDir);
        
        // Filter only .sql files and sort them
        const migrationFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort(); // This sorts: 001_xxx.sql, 002_xxx.sql, etc.
        
        console.log(`📁 Found ${migrationFiles.length} migration file(s):`);
        migrationFiles.forEach(file => console.log(`   - ${file}`));
        
        // Execute each migration in order
        for (const file of migrationFiles) {
            console.log(`\n⚙️  Executing: ${file}`);
            const migrationPath = path.join(migrationsDir, file);
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
            
            await pool.query(migrationSQL);
            console.log(`✅ Completed: ${file}`);
        }
        
        console.log('\n🎉 All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
        console.log('🔒 Database connection closed');
    }
}

executeMigrations();