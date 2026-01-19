import { Router } from 'express';
import * as customerController from './customer.controller';
import { authMiddleware, adminOnly, tenantMiddleware } from '../../middlewares/index';

const router = Router();

// All routes require auth + tenant context
router.use(authMiddleware);
router.use(tenantMiddleware);

// Read access for admin and workers
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomer);

// Write access for admin only
router.post('/', adminOnly, customerController.createCustomer);
router.put('/:id', adminOnly, customerController.updateCustomer);
router.delete('/:id', adminOnly, customerController.deleteCustomer);

export default router;
