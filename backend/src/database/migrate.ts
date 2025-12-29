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

async function executeMigration() {
    try{
        console.log('Executing database migration...');
        const migrationFile = path.join(__dirname, 'migrations', '001_initial_schema.sql');
        const migration = fs.readFileSync(migrationFile, 'utf8');
        await pool.query(migration);
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }finally{
        await pool.end();
        console.log('Database connection closed');
    }
}

executeMigration();