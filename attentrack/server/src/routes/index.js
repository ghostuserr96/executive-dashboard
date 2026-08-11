import { Router } from 'express';
import v1Routes from './v1/index.js';

const router = Router();

// API Version 1
router.use('/v1', v1Routes);
router.use('/', v1Routes); // Default route mapping to v1 for backwards compatibility

// Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AttenTrack Enterprise REST API is operational',
    version: 'v1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
