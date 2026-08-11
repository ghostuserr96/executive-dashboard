import express from 'express';
import { ingestDocument, chatWithDocument } from '../controllers/ragController.js';

const router = express.Router();

router.post('/ingest', ingestDocument);
router.post('/chat', chatWithDocument);

export default router;
