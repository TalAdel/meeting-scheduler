import { CustomError } from "../lib/custom-error";

export function parseDate(dateString: string, fieldName: string): Date {
    if (!dateString) {
      throw new CustomError(400, `${fieldName} is required`);
    }
  
    const date = new Date(dateString);
  
    // Check if date is valid
    // Invalid dates have NaN for getTime()
    if (isNaN(date.getTime())) {
      throw new CustomError(
        400, 
        `${fieldName} must be a valid ISO 8601 date (e.g., "2028-05-17T14:00:00+03:00")`
      );
    }
  
    return date;
  }

  export function validateNotInPast(date: Date, fieldName: string): void {
    const now = new Date();
    
    if (date < now) {
      throw new CustomError(400, `${fieldName} cannot be in the past`);
    }
  }