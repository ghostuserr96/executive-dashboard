import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';
import { syncRealData } from '../services/realDataSyncEngine.js';

const router = Router();

router.get('/', getEmployees);
router.post('/', createEmployee);
router.post('/sync-real-data', async (req, res) => {
  try {
    await syncRealData();
    res.json({ success: true, message: 'Synced real data successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
