import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types/index';
import { errorResponse } from '../utils/response';

// Check if user has one of the allowed roles
export const roleMiddleware = (...allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            errorResponse(res, 'Authentication required', 401);
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            errorResponse(res, 'Insufficient permissions', 403);
            return;
        }

        next();
    };
};

// Convenience middlewares
export const adminOnly = roleMiddleware(UserRole.ADMIN);
export const workerOnly = roleMiddleware(UserRole.WORKER);
export const adminOrWorker = roleMiddleware(UserRole.ADMIN, UserRole.WORKER);
