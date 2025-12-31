import { UserWithoutPassword, User } from "../types/user";
import UserRepository from "../repositories/user.repository";
import { CustomError } from "../lib/custom-error";

class UserService {
    constructor(private userRepository: UserRepository) {}

    async updateProfile(
        userId: string, 
        updates: Partial<Pick<User, 'fullName' | 'email'>>
    ): Promise<UserWithoutPassword> {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new CustomError(404, 'User not found');
        }

        const actualUpdates: Partial<Pick<User, 'fullName' | 'email'>> = {};
        
        if (updates.fullName !== undefined) {
            actualUpdates.fullName = updates.fullName;
        }
        
        if (updates.email !== undefined) {
            if (updates.email !== user.email) {
                const existingUser = await this.userRepository.findUserByEmail(updates.email);
                if (existingUser) {
                    throw new CustomError(400, 'Email already in use');
                }
            }
            actualUpdates.email = updates.email;
        }

        if (Object.keys(actualUpdates).length === 0) {
            return {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
        }

        const updatedUser = await this.userRepository.updateUser(userId, actualUpdates);
        
        if (!updatedUser) {
            throw new CustomError(500, 'Failed to update user');
        }

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };
    }

    async getUserProfile(userId: string): Promise<UserWithoutPassword> {
        const user = await this.userRepository.findUserWithoutPasswordByEmail(
            (await this.userRepository.findUserById(userId))?.email || ''
        );
        
        if (!user) {
            throw new CustomError(404, 'User not found');
        }

        return user;
    }

    async deleteAccount(userId: string): Promise<void> {
        const deleted = await this.userRepository.deleteUser(userId);
        if (!deleted) {
            throw new CustomError(404, 'User not found or already deleted');
        }
    }
}

export default UserService;
