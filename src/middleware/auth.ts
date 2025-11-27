import dotenv from 'dotenv';

// import "dotenv/config";
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

dotenv.config();

export interface AuthRequest extends Request {
    user?: { userId: string };
}

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '1h' });
}


export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log("token..", token, " JWT_SECRET.", process.env.JWT_SECRET);

    if (!token) {
        res.status(401).json({
            success: false,
            error: 'Access denied. No token provided.'
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
        

        console.log("decoded..", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("error", error);
        res.status(401).json({
            success: false,
            error: 'Invalid token.'
        });
    }
};