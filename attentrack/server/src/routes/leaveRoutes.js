import { Router } from 'express';
import { getLeaveRequests, getLeaveRequestById, createLeaveRequest, updateLeaveStatus, deleteLeaveRequest } from '../controllers/leaveController.js';

const router = Router();

router.get('/', getLeaveRequests);
router.get('/:id', getLeaveRequestById);
router.post('/', createLeaveRequest);
router.patch('/:id/status', updateLeaveStatus);
router.delete('/:id', deleteLeaveRequest);

export default router;

