import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { uploadSingleMiddleware } from '../middleware/uploadMiddleware.js';

const router = Router();

// Endpoint for uploading single image (supports multipart/form-data & base64 json)
router.post('/single', uploadSingleMiddleware('image'), uploadImage);
router.post('/base64', uploadImage);
router.post('/', uploadSingleMiddleware('image'), uploadImage);

export default router;
