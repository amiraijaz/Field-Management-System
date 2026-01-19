import { Router } from 'express';
import * as taskController from './task.controller';
import { authMiddleware, adminOnly, adminOrWorker, tenantMiddleware } from '../../middlewares/index';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Routes under /api/tasks
// Get and create tasks for a job
router.get('/job/:jobId', adminOrWorker, taskController.getTasks);
router.post('/job/:jobId', adminOnly, taskController.createTask);

// Task operations
router.put('/:taskId', adminOnly, taskController.updateTask);
router.post('/:taskId/complete', adminOrWorker, taskController.completeTask);
router.delete('/:taskId', adminOnly, taskController.deleteTask);

export default router;
