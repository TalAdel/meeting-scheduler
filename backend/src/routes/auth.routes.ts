import { Router, Request, Response } from "express";
import AuthService from "../services/auth.service";
import UserRepository from "../repositories/user.repository";
import pool from "../config/database";
import validateRequest, { 
    emailValidation,
    fullNameValidation,
    passwordValidation,
    passwordRequiredValidation,
} from "../middlewares/validate-request";
import authenticate from "../middlewares/auth-request";

const router = Router();

const userRepository = new UserRepository(pool);
const authService = new AuthService(userRepository);


router.post('/signup',
    [
        ...emailValidation,
        ...fullNameValidation,
        ...passwordValidation,
    ],
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
        const { email, password, fullName } = req.body;
        const newUser = await authService.signup(email, fullName, password);
        res.status(201).json({ user: newUser });
    }
);

router.post('/login',
    [
        ...emailValidation,
        ...passwordRequiredValidation,
    ],
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;
        const loginUser = await authService.login(email, password);
        res.status(200).json(loginUser);
    }
);

router.post(
    '/change-password',
    authenticate,
    [...passwordRequiredValidation, ...passwordValidation],
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId!;
      
      await authService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({ message: 'Password changed successfully' });
    }
);

export default router;