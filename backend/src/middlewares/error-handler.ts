import {Request, Response, NextFunction } from "express";
import { CustomError } from "../lib/custom-error";


 const errorHandler = (
    err: Error | CustomError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {


    if(err instanceof CustomError){
        res.status(err.statusCode).json({ message: err.message });
    }
   
    res.status(500).json({ message: err.message || 'Internal Server Error' });
    // const response: any = {
    //     status: statusCode,
    //     message: message,
    // };

    // if(process.env.NODE_ENV === 'development'){
    //     response.stack = err.stack;
    // }

    // res.status(statusCode).json(response);
};

export default errorHandler;















