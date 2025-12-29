import JwtService from "../services/jwt.service";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../lib/custom-error";

declare global{
    namespace Express{
        interface Request{
            userId: string;
        }
    }
}

const authenticate = async (
    req: Request, 
    _res: Response, 
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new CustomError(401, 'no token provided');
    }

    const token = authHeader.split(' ')[1];

    if(!token) {
        throw new CustomError(401, 'no token provided');
    }

    const payload = JwtService.verifyToken(token);

    req.userId = payload.userId;

    next();
}

export default authenticate;
