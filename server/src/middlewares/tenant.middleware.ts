import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index';
import { errorResponse } from '../utils/response';

// Middleware to ensure tenant isolation
// Adds tenantId to request for use in queries
export const tenantMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user || !req.user.tenantId) {
        errorResponse(res, 'Tenant context required', 403);
        return;
    }

    // Tenant ID is already in req.user from auth middleware
    next();
};

// Helper to get tenant ID from request
export const getTenantId = (req: AuthRequest): string => {
    if (!req.user?.tenantId) {
        throw new Error('No tenant context');
    }
    return req.user.tenantId;
};
