import { Router } from 'express';
import { signup, login, getMe, changePassword, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/change-password', changePassword);

export default router;
