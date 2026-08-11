import { Router } from 'express';
import authRoutes from '../authRoutes.js';
import employeeRoutes from './employee.routes.js';
import attendanceRoutes from './attendance.routes.js';
import leaveRoutes from '../leaveRoutes.js';
import taskRoutes from '../taskRoutes.js';
import announcementRoutes from '../announcementRoutes.js';
import uploadRoutes from '../uploadRoutes.js';
import performanceRoutes from '../performanceRoutes.js';
import recruitmentRoutes from '../recruitmentRoutes.js';
import googleRoutes from '../googleRoutes.js';
import learningRoutes from '../learningRoutes.js';
import documentRoutes from '../documentRoutes.js';
import departmentRoutes from '../departmentRoutes.js';
import jobsRoutes from '../jobsRoutes.js';
import ragRoutes from '../ragRoutes.js';
import payrollRoutes from '../payrollRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leave', leaveRoutes);
router.use('/tasks', taskRoutes);
router.use('/announcements', announcementRoutes);
router.use('/upload', uploadRoutes);
router.use('/performance', performanceRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/google', googleRoutes);
router.use('/learning', learningRoutes);
router.use('/documents', documentRoutes);
router.use('/rag', ragRoutes);
router.use('/', departmentRoutes);

// Direct /jobs mapping for specification requirement
router.use('/jobs', jobsRoutes);
router.use('/payroll', payrollRoutes);

export default router;
