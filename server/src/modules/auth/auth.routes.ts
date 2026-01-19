import { Router } from 'express';
import * as authController from './auth.controller';
import { authMiddleware } from '../../middlewares/index';

const router = Router();

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

// Protected routes
router.get('/me', authMiddleware, authController.me);

export default router;
