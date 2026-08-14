import { Router } from 'express';
import { upload } from '../../core/middlewares/upload.middleware';
import { uploadFile, uploadMultipleFiles } from './upload.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

// Single file upload
router.post('/', protect, upload.single('file'), uploadFile);

// Multiple files upload (up to 10)
router.post('/multiple', protect, upload.array('files', 10), uploadMultipleFiles);

export default router;
