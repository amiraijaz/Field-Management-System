import { Router } from 'express';
import * as jobController from './job.controller';
import { authMiddleware, adminOnly, adminOrWorker, tenantMiddleware } from '../../middlewares/index';

const router = Router();

// Public route for customer access via token
router.get('/customer/:token', jobController.getJobByToken);

// Protected routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Worker route for assigned jobs
router.get('/worker/assigned', adminOrWorker, jobController.getWorkerJobs);

// Admin routes
router.get('/', adminOnly, jobController.getJobs);
router.post('/', adminOnly, jobController.createJob);
router.post('/:id/archive', adminOnly, jobController.archiveJob);
router.post('/:id/unarchive', adminOnly, jobController.unarchiveJob);
router.delete('/:id', adminOnly, jobController.deleteJob);

// Admin and Worker routes
router.get('/:id', adminOrWorker, jobController.getJob);
router.put('/:id', adminOrWorker, jobController.updateJob);

export default router;
