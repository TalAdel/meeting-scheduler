import jwt from 'jsonwebtoken';
import { CustomError } from '../lib/custom-error';

interface JwtPayload {
    userId: string;
}

export default class JwtService{

    static generateToken(userId: string): string {
        return jwt.sign(
            { userId }, 
            process.env.JWT_SECRET!, 
            { 
              expiresIn: '1h',
              algorithm: 'HS256'
            }
        );
    }

    static verifyToken(token: string): JwtPayload {
        try {
        return jwt.verify(token, process.env.JWT_SECRET!, {
                    algorithms: ['HS256']
            }) as JwtPayload;
        } catch (error) {
            throw new CustomError(401, 'invalid or expired token');
        }
    }
    
}