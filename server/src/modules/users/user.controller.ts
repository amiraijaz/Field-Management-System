import { Response } from 'express';
import * as userService from './user.service';
import { AuthRequest } from '../../types/index';
import { successResponse, errorResponse, createdResponse } from '../../utils/response';
import { getTenantId } from '../../middlewares/tenant.middleware';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const users = await userService.getUsers(tenantId);
        successResponse(res, users);
    } catch (error) {
        console.error('Get users error:', error);
        errorResponse(res, 'Failed to fetch users', 500);
    }
};

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const user = await userService.getUserById(tenantId, req.params.id);

        if (!user) {
            errorResponse(res, 'User not found', 404);
            return;
        }

        successResponse(res, user);
    } catch (error) {
        console.error('Get user error:', error);
        errorResponse(res, 'Failed to fetch user', 500);
    }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const { email, password, name, role } = req.body;

        if (!email || !password || !name || !role) {
            errorResponse(res, 'Email, password, name, and role are required', 400);
            return;
        }

        const user = await userService.createUser({
            tenantId,
            email,
            password,
            name,
            role,
        });

        createdResponse(res, user, 'User created successfully');
    } catch (error: any) {
        console.error('Create user error:', error);
        if (error.code === '23505') {
            errorResponse(res, 'Email already exists', 409);
            return;
        }
        errorResponse(res, 'Failed to create user', 500);
    }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const user = await userService.updateUser(tenantId, req.params.id, req.body);

        if (!user) {
            errorResponse(res, 'User not found', 404);
            return;
        }

        successResponse(res, user, 'User updated successfully');
    } catch (error: any) {
        console.error('Update user error:', error);
        if (error.code === '23505') {
            errorResponse(res, 'Email already exists', 409);
            return;
        }
        errorResponse(res, 'Failed to update user', 500);
    }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);

        // Prevent self-deletion
        if (req.params.id === req.user?.userId) {
            errorResponse(res, 'Cannot delete your own account', 400);
            return;
        }

        const deleted = await userService.deleteUser(tenantId, req.params.id);

        if (!deleted) {
            errorResponse(res, 'User not found', 404);
            return;
        }

        successResponse(res, null, 'User deleted successfully');
    } catch (error) {
        console.error('Delete user error:', error);
        errorResponse(res, 'Failed to delete user', 500);
    }
};

export const getWorkers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const workers = await userService.getWorkers(tenantId);
        successResponse(res, workers);
    } catch (error) {
        console.error('Get workers error:', error);
        errorResponse(res, 'Failed to fetch workers', 500);
    }
};
