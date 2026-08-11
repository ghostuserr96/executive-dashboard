import { Router } from 'express';
import { getAttendanceLogs, clockIn, clockOut, markAttendance } from '../controllers/attendanceController.js';

const router = Router();

router.get('/', getAttendanceLogs);
router.post('/clock-in', clockIn);
router.post('/mark', markAttendance);
router.put('/clock-out/:id', clockOut);

export default router;
