import { LoginUserResponse, UserWithoutPassword } from "../types/user";
import UserRepository from "../repositories/user.repository";
import PasswordUtils from "../utils/password.service";
import JwtService from "./jwt.service";
import { CustomError } from "../lib/custom-error";

class AuthService{
    constructor(private userRepository: UserRepository) {
    }

    async signup(email: string, fullName: string, password: string): Promise<UserWithoutPassword> {

        const existingUser = await this.userRepository.findUserByEmail(email);
        if(existingUser) {
            throw new CustomError(400, 'User already exists');
        }

        const hashedPassword = await PasswordUtils.hashPassword(password);

        const newUser = await this.userRepository.createUser(email, fullName, hashedPassword);

        return newUser;
    }

    async login(email: string, password: string): Promise<LoginUserResponse> {
        const user = await this.userRepository.findUserByEmail(email);
        if(!user) {
            throw new CustomError(404, 'Invalid email or password');
        }
        
        const isPasswordValid = await PasswordUtils.verifyPassword( password, user.password);
        if(!isPasswordValid) {
            throw new CustomError(401, 'Invalid email or password');
        }

        const token = JwtService.generateToken(user.id);

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            token: token,
        };
    }

    // async logout(userId: string): Promise<void> {


    // }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findUserById(userId);
        if(!user) {
            throw new CustomError(404, 'User not found');
        }

        const isCurrentPasswordValid = await PasswordUtils.verifyPassword(currentPassword, user.password);
        if(!isCurrentPasswordValid) {
            throw new CustomError(401, 'Current password is incorrect');
        }

        const hashedPassword = await PasswordUtils.hashPassword(newPassword);
        
        await this.userRepository.updatePassword(userId, hashedPassword);
        
    }

}
export default AuthService;