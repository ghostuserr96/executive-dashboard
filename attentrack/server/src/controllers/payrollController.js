import { PayrollHistoryModel } from '../models/PayrollHistory.js';

export const getPayrollHistory = async (req, res, next) => {
  try {
    const history = await PayrollHistoryModel.findAll();
    res.status(200).json({
      status: 'success',
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payroll history: ' + error.message });
  }
};

export const runPayroll = async (req, res, next) => {
  try {
    const { totalBase, totalBonus, totalDeductions, netPay, employeesProcessed } = req.body;
    
    if (employeesProcessed === undefined) {
      return res.status(400).json({ success: false, message: 'Missing payroll calculation data' });
    }
    
    const record = await PayrollHistoryModel.create({
      totalBase,
      totalBonus,
      totalDeductions,
      netPay,
      employeesProcessed
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Payroll successfully processed and locked for this month.',
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to run payroll: ' + error.message });
  }
};
