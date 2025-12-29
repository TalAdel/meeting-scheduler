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
        return true;
      }),
  
    body('location')
      .trim()
      .notEmpty().withMessage('Location is required'),
  
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
        if (value < new Date()) {
          throw new CustomError(400, 'Start time cannot be in the past');
        }
        return true;
      }),
  
    body('endTime')
      .optional()  
      .isISO8601().withMessage('End time must be a valid ISO 8601 date if provided')
      .toDate() 
      .custom((value) => {
        if (value < new Date()) {
          throw new CustomError(400, 'End time cannot be in the past');
        }
        return true;
      })
      .custom((value, { req }) => {
        const startTime = req.body.startTime;
        if (value <= startTime) {
          throw new CustomError(400, 'End time must be after start time');
        }
        return true;
      }),
  
    body('location')
      .optional()  
      .trim()
      .notEmpty().withMessage('Location cannot be empty if provided')
      .isLength({ min: 1, max: 200 }).withMessage('Location must be between 1 and 200 characters'),
  
    body('notes')
      .optional()
      .trim()
  ];

export const RsvpValidation: ValidationChain[] = [
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