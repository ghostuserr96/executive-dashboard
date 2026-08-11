import { rtdb } from '../config/db.js';
import { generateId } from '../utils/generateId.js';

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

export const PayrollHistoryModel = {
  findAll: async () => {
    return await listGet('payroll_history');
  },
  
  create: async (data) => {
    const id = generateId();
    const newRecord = {
      id,
      timestamp: new Date().toISOString(),
      month: new Date().getMonth(), // 0-11
      year: new Date().getFullYear(),
      totalBase: data.totalBase || 0,
      totalBonus: data.totalBonus || 0,
      totalDeductions: data.totalDeductions || 0,
      netPay: data.netPay || 0,
      employeesProcessed: data.employeesProcessed || 0
    };
    
    await rtdb.ref(`payroll_history/${id}`).set(newRecord);
    return newRecord;
  }
};
