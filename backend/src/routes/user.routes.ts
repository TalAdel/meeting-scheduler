import { Router, Request, Response } from "express";
import UserService from "../services/user.service";
import UserRepository from "../repositories/user.repository";
import pool from "../config/database";
import { body } from "express-validator";
import validateRequest from "../middlewares/validate-request";
import authenticate from "../middlewares/auth-request";

const router = Router();

const userRepository = new UserRepository(pool);
const userService = new UserService(userRepository);

/**
 * Optional validation for profile updates
 * Why optional? Because we want to allow partial updates:
 * - User can update ONLY fullName
 * - User can update ONLY email  
 * - User can update BOTH
 * - User can send neither (no-op)
 */
const optionalFullNameValidation = body('fullName')
    .optional()
    .isString().withMessage('Full name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters');

const optionalEmailValidation = body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail();

/**
 * GET /users/profile
 * Get current user's profile
 */
router.get(
    '/profile',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const userId = req.userId!;
        const user = await userService.getUserProfile(userId);
        res.status(200).json({ user });
    }
);

router.put(
    '/profile',
    authenticate,
    [optionalFullNameValidation, optionalEmailValidation],
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
        const userId = req.userId!;
        
        // Build updates object with ONLY the fields present in the request
        const updates: Partial<{ fullName: string; email: string }> = {};
        
        // Only add to updates if the field was actually sent in the request
        if (req.body.fullName !== undefined) {
            updates.fullName = req.body.fullName;
        }
        
        if (req.body.email !== undefined) {
            updates.email = req.body.email;
        }

        const updatedUser = await userService.updateProfile(userId, updates);
        res.status(200).json({ user: updatedUser });
    }
);


router.get(
    '/:id',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const userId = req.params.id;
        const user = await userService.getUserProfile(userId);
        res.status(200).json({ user });
    }
);

// just for implementing the delete CRUD operation for user, its only for development purposes
router.delete(
    '/account',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const userId = req.userId!;
        await userService.deleteAccount(userId);
        res.status(200).json({ message: 'Account deleted successfully' });
    }
);

export default router;

