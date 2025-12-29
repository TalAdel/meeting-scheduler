import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';


export const passwordValidation: ValidationChain[] = [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    
    body('password')
      .isLength({ max: 128 })
      .withMessage('Password must be less than 128 characters'),
    
    body('password')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter'),
    
    body('password')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),
    
    body('password')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character (!@#$%^&*...)'),
  ];

export const emailValidation: ValidationChain[] = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
];

export const fullNameValidation: ValidationChain[] = [
  body('fullName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
];

export const userIdValidation: ValidationChain[] = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
];

export const passwordRequiredValidation: ValidationChain[] = [
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    
    next();
};

export default validateRequest;

