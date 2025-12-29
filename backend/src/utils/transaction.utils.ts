import { Pool, PoolClient } from 'pg';

/**
 * Transaction wrapper utility for database operations
 * Ensures ACID compliance by wrapping multiple operations in a single transaction
 * 
 * @param pool - PostgreSQL connection pool
 * @param callback - Function containing database operations to execute within transaction
 * @returns Result of the callback function
 * @throws Error from callback or transaction management
 */
export async function withTransaction<T>(
  pool: Pool,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    // BEGIN TRANSACTION
    await client.query('BEGIN');
    
    // Execute all operations within transaction
    const result = await callback(client);
    
    // COMMIT - All operations succeeded
    await client.query('COMMIT');
    
    return result;
  } catch (error) {
    // ROLLBACK - Something failed, revert everything
    await client.query('ROLLBACK');
    
    // Re-throw the error to be handled by caller
    throw error;
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}

/**
 * Why this pattern?
 * 
 * 1. ATOMICITY: All operations succeed together or fail together
 * 2. CONSISTENCY: Database never left in partial/invalid state  
 * 3. ISOLATION: Transaction isolated from other concurrent operations
 * 4. DURABILITY: Once committed, data persists even if system crashes
 * 
 * 5. SINGLE RESPONSIBILITY: This utility has one job - manage transactions
 * 6. OPEN/CLOSED: Easy to extend (add logging, metrics) without modifying
 * 7. DEPENDENCY INVERSION: Depends on abstraction (callback) not concrete implementation
 */

