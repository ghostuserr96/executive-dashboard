import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getTeams,
  getTeamById,
  getTeamsByDepartment,
  createTeam,
  updateTeam,
  deleteTeam
} from '../controllers/departmentController.js';

const router = Router();

router.get('/departments', getDepartments);
router.get('/departments/:id', getDepartmentById);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

router.get('/teams', getTeams);
router.get('/teams/:id', getTeamById);
router.get('/departments/:departmentId/teams', getTeamsByDepartment);
router.post('/teams', createTeam);
router.put('/teams/:id', updateTeam);
router.delete('/teams/:id', deleteTeam);

export default router;
