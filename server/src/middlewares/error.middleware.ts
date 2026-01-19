import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

interface ApiError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorMiddleware = (
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    // Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }

    // Known errors with status codes
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 && env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Something went wrong';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

// Custom error class
export class AppError extends Error {
    statusCode: number;
    code?: string;

    constructor(message: string, statusCode = 400, code?: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
};
