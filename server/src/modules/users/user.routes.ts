import { Router } from 'express';
import * as userController from './user.controller';
import { authMiddleware, adminOnly, tenantMiddleware } from '../../middlewares/index';

const router = Router();

// All routes require auth + admin role
router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(adminOnly);

router.get('/', userController.getUsers);
router.get('/workers', userController.getWorkers);
router.get('/:id', userController.getUser);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
