import { Router } from 'express';
import {
  getPerformanceReviews,
  getEmployeePerformance,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview
} from '../controllers/performanceController.js';

const router = Router();

router.get('/', getPerformanceReviews);
router.get('/employee/:employeeId', getEmployeePerformance);
router.post('/', createPerformanceReview);
router.patch('/:id', updatePerformanceReview);
router.delete('/:id', deletePerformanceReview);

export default router;
