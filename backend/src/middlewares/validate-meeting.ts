import { body, ValidationChain } from "express-validator";
import { CustomError } from "../lib/custom-error";
import { AttendingStatus } from "../types/enums";


export const MeetingValidation = [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  
    body('startTime')
      .notEmpty().withMessage('Start time is required')
      .isISO8601().withMessage('Start time must be a valid ISO 8601 date')
      .toDate()  
      .custom((value) => {
        if (value < new Date()) {
          throw new CustomError(400, 'Start time cannot be in the past');
        }
        return true;
      }),
  
    body('endTime')
      .notEmpty().withMessage('End time is required')
      .isISO8601().withMessage('End time must be a valid ISO 8601 date')
      .toDate()  
      .custom((value, { req }) => {
        const startTime = req.body.startTime;
        if (value <= startTime) {
          throw new CustomError(400, 'End time must be after start time');
        }
        
        // Check meeting duration (max 8 hours)
        const durationMs = value.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        if (durationHours > 8) {
          throw new CustomError(400, 'Meeting cannot be longer than 8 hours');
        }
        
        return true;
      }),
  
    body('location')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Location must be less than 500 characters'),
  
    body('locationCountry')
      .optional()
      .trim()
      .isLength({ min: 2, max: 2 }).withMessage('Country code must be 2 characters (ISO 3166-1)')
      .matches(/^[A-Z]{2}$/).withMessage('Country code must be uppercase letters (e.g., IL, US, FR)'),
  
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
    body('notes')
      .optional()
      .trim()
  ];

  export const UpdateMeetingValidation: ValidationChain[] = [
    body('title')
      .optional()   
      .trim()
      .notEmpty().withMessage('Title cannot be empty if provided')
      .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
    body('startTime')
      .optional()  
      .isISO8601().withMessage('Start time must be a valid ISO 8601 date if provided')
      .toDate()  
      .custom((value) => {
        // Allow updates to meetings that started up to 5 minutes ago (for timezone tolerance)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (value < fiveMinutesAgo) {
          throw new CustomError(400, 'Start time cannot be more than 5 minutes in the past');
        }
        return true;
      }),
  
    body('endTime')
      .optional()  
      .isISO8601().withMessage('End time must be a valid ISO 8601 date if provided')
      .toDate() 
      .custom((value, { req }) => {
        const startTime = req.body.startTime;
        if (startTime && value <= startTime) {
          throw new CustomError(400, 'End time must be after start time');
        }
        
        // Check meeting duration (max 8 hours) only if both times are provided
        if (startTime && value) {
          const durationMs = value.getTime() - startTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          if (durationHours > 8) {
            throw new CustomError(400, 'Meeting cannot be longer than 8 hours');
          }
        }
        
        return true;
      }),
  
    body('location')
      .optional()  
      .trim()
      .isLength({ max: 500 }).withMessage('Location must be less than 500 characters'),
  
    body('locationCountry')
      .optional()
      .trim()
      .isLength({ min: 2, max: 2 }).withMessage('Country code must be 2 characters')
      .matches(/^[A-Z]{2}$/).withMessage('Country code must be uppercase letters'),
  
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
    body('notes')
      .optional()
      .trim()
  ];

export const statusValidation: ValidationChain[] = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .custom((value) => {
      const validStatuses = Object.values(AttendingStatus);
      if (!validStatuses.includes(value)) {
        throw new CustomError(400, `Status must be one of: ${validStatuses.join(', ')}`);
      }
      return true;
    })
];