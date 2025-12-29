import bcrypt from 'bcrypt';

export default class PasswordUtils{
    private static readonly SALT_ROUNDS = 10;

    static async hashPassword(password: string): Promise<string> {
        if(!password) {
            throw new Error('Password is required');
        }

        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    static async verifyPassword(
        plainPassword: string, 
        hashedPassword: string
    ): Promise<boolean> {
        if(!plainPassword || !hashedPassword) {
            return false;
        }

        return bcrypt.compare(plainPassword, hashedPassword);
    }

}