import { Pool } from "pg";
import { UserRow , UserWithoutPasswordRow} from "../types/database";
import { UserWithoutPassword , User } from "../types/user";


class UserRepository{
  
    constructor(private pool: Pool) {
    }

   async createUser( email: string, fullName: string, password: string): Promise<UserWithoutPassword> {
      const createUserQuery = `INSERT INTO users (email, full_name, password)
                                VALUES ($1, $2, $3)
                                RETURNING id, email, full_name, created_at, updated_at`;
      const result = await this.pool.query<UserRow>(createUserQuery, [email, fullName, password]);

      if(result.rows.length === 0) {
        throw new Error('Failed to create user');
      }
      const user = result.rows[0];

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
   }

    async findUserById(id: string): Promise<User | null> {
        const userByIdQuery = `SELECT * FROM users WHERE id = $1`;
        const result = await this.pool.query<UserRow>(userByIdQuery, [id]);

        if(result.rows.length === 0) {
          return null;
        }

        const user = result.rows[0];
        return {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          password: user.password,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        };
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const exsitingUserQuery = `SELECT id, email, full_name, password, created_at, updated_at 
                                   FROM users WHERE email = $1`;
        
        const result = await this.pool.query<UserRow>(exsitingUserQuery, [email]);

        if(result.rows.length === 0) {
          return null;
        }

        const user = result.rows[0];

        return {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          password: user.password,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        };
    }

    async findUsersByEmails(emails: string[]): Promise<UserWithoutPassword[]> {
      const findUsersByEmailsQuery = `SELECT id, email, full_name, created_at, updated_at 
                                      FROM users 
                                      WHERE email = ANY($1)`;
      const result = await this.pool.query<UserWithoutPasswordRow>(findUsersByEmailsQuery, [emails]);
      
      if(result.rows.length === 0) {
        return [];
      }

      return result.rows.map(row => ({
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }

    async findUserWithoutPasswordByEmail(email: string): Promise< UserWithoutPassword | null> {
      const userWithoutPasswordQuery = `SELECT id, email, full_name, created_at, updated_at 
                                        FROM users WHERE email = $1`;

      const result = await this.pool.query<UserWithoutPasswordRow>(userWithoutPasswordQuery, [email]);

        if(result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];

      return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      };
  }

    async updateUser(id: string, updates: Partial<Pick<User, 'fullName' | 'email' >>): Promise<User | null> {

      const fileds: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if(updates.fullName !== undefined) {
        fileds.push(`full_name = $${paramIndex++}`);
        values.push(updates.fullName);
      } 
      if(updates.email !== undefined) {
        fileds.push(`email = $${paramIndex++}`);
        values.push(updates.email);
      }

      if(fileds.length === 0) {
        return this.findUserById(id);
      }

      values.push(id);

      const updateUserQuery = `UPDATE users
      SET ${fileds.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *`;

      const result = await this.pool.query<UserRow>(updateUserQuery, values);

      if(result.rows.length === 0) {
        return this.findUserById(id);
      }

      const user = result.rows[0];

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        password: user.password,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    }

    async deleteUser(id: string): Promise<boolean> {
      const deleteUserQuery = `DELETE FROM users WHERE id = $1`;
      const result = await this.pool.query(deleteUserQuery, [id]);

      if (result.rowCount === undefined || result.rowCount === null) {
        throw new Error('DB error: undefined || null delete user result');
      }
      
      return result.rowCount > 0;
  }
    
    async updatePassword(id: string, password: string): Promise<boolean> { 
      const updatePasswordQuery = `UPDATE users SET password = $1 WHERE id = $2`;
      const result = await this.pool.query(updatePasswordQuery, [password, id]);

      if(result.rowCount === undefined || result.rowCount === null) {
        throw new Error('DB error: undefined || null update password result');
      }
      return result.rowCount > 0;
    }

}

export default UserRepository;
