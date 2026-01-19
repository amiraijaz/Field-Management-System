import { Response } from 'express';
import * as customerService from './customer.service';
import { AuthRequest } from '../../types/index';
import { successResponse, errorResponse, createdResponse } from '../../utils/response';
import { getTenantId } from '../../middlewares/tenant.middleware';

export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const search = req.query.search as string | undefined;
        const customers = await customerService.getCustomers(tenantId, search);
        successResponse(res, customers);
    } catch (error) {
        console.error('Get customers error:', error);
        errorResponse(res, 'Failed to fetch customers', 500);
    }
};

export const getCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const customer = await customerService.getCustomerById(tenantId, req.params.id);

        if (!customer) {
            errorResponse(res, 'Customer not found', 404);
            return;
        }

        successResponse(res, customer);
    } catch (error) {
        console.error('Get customer error:', error);
        errorResponse(res, 'Failed to fetch customer', 500);
    }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const { name, email, phone, address } = req.body;

        if (!name) {
            errorResponse(res, 'Name is required', 400);
            return;
        }

        const customer = await customerService.createCustomer({
            tenantId,
            name,
            email,
            phone,
            address,
        });

        createdResponse(res, customer, 'Customer created successfully');
    } catch (error) {
        console.error('Create customer error:', error);
        errorResponse(res, 'Failed to create customer', 500);
    }
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const customer = await customerService.updateCustomer(tenantId, req.params.id, req.body);

        if (!customer) {
            errorResponse(res, 'Customer not found', 404);
            return;
        }

        successResponse(res, customer, 'Customer updated successfully');
    } catch (error) {
        console.error('Update customer error:', error);
        errorResponse(res, 'Failed to update customer', 500);
    }
};

export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const deleted = await customerService.deleteCustomer(tenantId, req.params.id);

        if (!deleted) {
            errorResponse(res, 'Customer not found', 404);
            return;
        }

        successResponse(res, null, 'Customer deleted successfully');
    } catch (error) {
        console.error('Delete customer error:', error);
        errorResponse(res, 'Failed to delete customer', 500);
    }
};
