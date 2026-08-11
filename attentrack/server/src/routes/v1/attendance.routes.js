import { Router } from 'express';
import { getAttendanceLogs, clockIn, clockOut, markAttendance } from '../../controllers/attendanceController.js';

const router = Router();

router.route('/')
  .get(getAttendanceLogs);

router.route('/clock-in')
  .post(clockIn);

router.route('/mark')
  .post(markAttendance);

router.route('/clock-out/:id')
  .put(clockOut);

export default router;
