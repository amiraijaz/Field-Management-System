import { Request, Response } from 'express';
import * as authService from './auth.service';
import { AuthRequest } from '../../types/index';
import { successResponse, errorResponse } from '../../utils/response';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            errorResponse(res, 'Email and password are required', 400);
            return;
        }

        const result = await authService.login(email, password);

        if (!result) {
            errorResponse(res, 'Invalid email or password', 401);
            return;
        }

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        successResponse(res, {
            user: result.user,
            accessToken: result.accessToken,
        }, 'Login successful');
    } catch (error) {
        console.error('Login error:', error);
        errorResponse(res, 'Login failed', 500);
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('refreshToken');
    successResponse(res, null, 'Logged out successfully');
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            errorResponse(res, 'Refresh token not found', 401);
            return;
        }

        const { verifyToken } = await import('../../utils/jwt.js');
        const decoded = verifyToken(refreshToken);

        if (!decoded) {
            res.clearCookie('refreshToken');
            errorResponse(res, 'Invalid refresh token', 401);
            return;
        }

        const tokens = await authService.refreshTokens(decoded.userId, decoded.tenantId);

        if (!tokens) {
            errorResponse(res, 'User not found', 401);
            return;
        }

        // Set new refresh token
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        successResponse(res, { accessToken: tokens.accessToken });
    } catch (error) {
        console.error('Refresh error:', error);
        errorResponse(res, 'Token refresh failed', 500);
    }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            errorResponse(res, 'Not authenticated', 401);
            return;
        }

        const user = await authService.getUserById(req.user.userId);

        if (!user) {
            errorResponse(res, 'User not found', 404);
            return;
        }

        successResponse(res, user);
    } catch (error) {
        console.error('Get me error:', error);
        errorResponse(res, 'Failed to get user', 500);
    }
};
