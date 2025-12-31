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



async function createMigrationsTable() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await pool.query(createTableSQL);
    console.log('✓ Migrations tracking table ready');
}

async function getExecutedMigrations(): Promise<string[]> {
    const result = await pool.query('SELECT filename FROM schema_migrations ORDER BY filename');
    return result.rows.map(row => row.filename);
}

async function markMigrationAsExecuted(filename: string) {
    await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
}

async function executeMigrations() {
    try {
        console.log('🚀 Starting database migrations...\n');

        // Step 1: Create tracking table
        await createMigrationsTable();

        // Step 2: Get list of already executed migrations
        const executedMigrations = await getExecutedMigrations();
        console.log(`✓ Already executed: ${executedMigrations.length} migrations`);

        // Step 3: Read all migration files from folder
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Sort alphabetically (001, 002, 003...)

        console.log(`✓ Found ${files.length} migration files\n`);

        // Step 4: Run new migrations only
        let newMigrationsCount = 0;
        for (const file of files) {
            if (executedMigrations.includes(file)) {
                console.log(`⊘ Skipping ${file} (already executed)`);
                continue;
            }

            console.log(`▶ Running ${file}...`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            // Execute migration
            await pool.query(sql);

            // Mark as executed
            await markMigrationAsExecuted(file);

            console.log(`✓ Completed ${file}\n`);
            newMigrationsCount++;
        }

        if (newMigrationsCount === 0) {
            console.log('✓ Database is up to date. No new migrations to run.');
        } else {
            console.log(`\n✅ Successfully ran ${newMigrationsCount} new migration(s)`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
        console.log('\n🔌 Database connection closed');
    }
}

executeMigrations();