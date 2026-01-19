import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as attachmentController from './attachment.controller';
import { authMiddleware, adminOrWorker, tenantMiddleware } from '../../middlewares/index';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req: any, file: any, cb: any) => {
    // Allow common file types
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, and common document formats are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// Protected routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Get attachments for a job
router.get('/job/:jobId', adminOrWorker, attachmentController.getAttachments);

// Upload attachment to a job
router.post('/job/:jobId', adminOrWorker, upload.single('file'), attachmentController.uploadAttachment);

// Download attachment
router.get('/:id/download', adminOrWorker, attachmentController.downloadAttachment);

// Delete attachment
router.delete('/:id', adminOrWorker, attachmentController.deleteAttachment);

export default router;
