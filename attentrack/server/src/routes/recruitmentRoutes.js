import { Router } from 'express';
import {
  getJobs,
  getJobBySlug,
  createJob,
  deleteJob,
  getCandidates,
  createCandidate,
  updateCandidateStage,
  deleteCandidate,
  submitPublicApplication
} from '../controllers/recruitmentController.js';

const router = Router();


// Rate limiter for candidate submissions (Max 10 applications per 15 min window per IP)
const submissionTracker = new Map();
const rateLimitSubmissions = (req, res, next) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxSubmissions = 10;

  const record = submissionTracker.get(clientIp) || { count: 0, firstSeen: now };
  if (now - record.firstSeen > windowMs) {
    record.count = 1;
    record.firstSeen = now;
  } else {
    record.count += 1;
  }
  submissionTracker.set(clientIp, record);

  if (record.count > maxSubmissions) {
    return res.status(429).json({
      success: false,
      message: 'Too many job applications submitted from this IP. Please try again in a few minutes.'
    });
  }
  next();
};

// Jobs Endpoints
router.get('/jobs', getJobs);
router.get('/jobs/slug/:slug', getJobBySlug);
router.post('/jobs', createJob);
router.delete('/jobs/:id', deleteJob);

// Public Applicant Submission Endpoints
router.post('/public/apply/:slug', rateLimitSubmissions, submitPublicApplication);
router.post('/public/apply', rateLimitSubmissions, submitPublicApplication);
router.post('/apply', rateLimitSubmissions, submitPublicApplication);

// HR Candidates & Pipeline Endpoints
router.get('/candidates', getCandidates);
router.post('/candidates', createCandidate);
router.patch('/candidates/:id/stage', updateCandidateStage);
router.delete('/candidates/:id', deleteCandidate);

export default router;


