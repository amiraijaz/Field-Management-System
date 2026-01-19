import { Router } from 'express';
import * as jobStatusController from './jobStatus.controller';
import { authMiddleware, adminOnly, tenantMiddleware } from '../../middlewares/index';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Read access for all authenticated users
router.get('/', jobStatusController.getJobStatuses);
router.get('/:id', jobStatusController.getJobStatus);

// Write access for admin only
router.post('/', adminOnly, jobStatusController.createJobStatus);
router.put('/:id', adminOnly, jobStatusController.updateJobStatus);
router.delete('/:id', adminOnly, jobStatusController.deleteJobStatus);
router.post('/reorder', adminOnly, jobStatusController.reorderStatuses);

export default router;
