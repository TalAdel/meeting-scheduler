export class CustomError extends Error{
    public statusCode: number;
    public message: string;
    // public isOperational: boolean;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        // this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}