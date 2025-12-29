
import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import pool from './config/database';

if(!process.env.PORT){
    throw new Error('PORT is not set')
}


async function checkDatabaseConnection(): Promise<void> {
  try{
    console.log('Checking database connection...');
    await pool.query('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('make sure the database is running (docker-compose up -d)');
    process.exit(1);
  }
}

async function startServer(): Promise<void> {

    await checkDatabaseConnection();

    console.log('Starting server...');
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port http://localhost:${process.env.PORT}`);
    });
}

process.on('SIGTERM' , async () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT' , async () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

startServer();