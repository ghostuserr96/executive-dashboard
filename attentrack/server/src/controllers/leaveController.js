import { LeaveModel } from '../models/Leave.js';

export const getLeaveRequests = async (req, res, next) => {
  try {
    const filter = {
      employeeId: req.query.employeeId,
      status: req.query.status
    };
    const leaves = await LeaveModel.findAll(filter);
    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    next(error);
  }
};

export const getLeaveRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leave = await LeaveModel.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

export const createLeaveRequest = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.body;
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Leave type, start date, and end date are required' });
    }
    const leave = await LeaveModel.createRequest(req.body);
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const updated = await LeaveModel.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteLeaveRequest = async (req, res, next) => {
  try {
    const success = await LeaveModel.deleteRequest(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    res.json({ success: true, message: 'Leave request canceled successfully' });
  } catch (error) {
    next(error);
  }
};

