import { Response, NextFunction } from 'express';
import { AuthRequest, JwtPayload } from '../types/index';
import { verifyToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            errorResponse(res, 'No token provided', 401);
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            errorResponse(res, 'Invalid or expired token', 401);
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        errorResponse(res, 'Authentication failed', 401);
    }
};

// Optional auth - doesn't fail if no token
export const optionalAuthMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);
            if (decoded) {
                req.user = decoded;
            }
        }

        next();
    } catch (error) {
        next();
    }
};
