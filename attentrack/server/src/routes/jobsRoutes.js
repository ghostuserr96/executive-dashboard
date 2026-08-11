import { Router } from 'express';
import {
  getJobs,
  getJobBySlug,
  createJob,
  deleteJob
} from '../controllers/recruitmentController.js';

const router = Router();

router.get('/', getJobs);
router.get('/slug/:slug', getJobBySlug);
router.post('/', createJob);
router.delete('/:id', deleteJob);

export default router;
