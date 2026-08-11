import express from 'express';
import { getPayrollHistory, runPayroll } from '../controllers/payrollController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/history', getPayrollHistory);
router.post('/run', runPayroll);

export default router;
