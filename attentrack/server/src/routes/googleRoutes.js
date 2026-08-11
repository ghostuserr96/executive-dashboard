import { Router } from 'express';
import {
  getOAuthUrl,
  handleCallback,
  handleWebhook,
  cleanupJobGoogleResources
} from '../controllers/googleController.js';

const router = Router();

// OAuth Authorization routes
router.get('/auth', getOAuthUrl);
router.get('/callback', handleCallback);

// Apps Script Webhook receiver
router.post('/webhook', handleWebhook);

// Cleanup Google Form & Drive folder for closed job
router.delete('/jobs/:id/google-cleanup', cleanupJobGoogleResources);
router.delete('/cleanup/:id', cleanupJobGoogleResources);

export default router;
