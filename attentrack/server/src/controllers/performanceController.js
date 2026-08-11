import { PerformanceModel } from '../models/Performance.js';

export const getPerformanceReviews = async (req, res, next) => {
  try {
    const filter = {
      employeeId: req.query.employeeId,
      department: req.query.department
    };
    const reviews = await PerformanceModel.findAll(filter);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const getEmployeePerformance = async (req, res, next) => {
  try {
    const reviews = await PerformanceModel.findByEmployeeId(req.params.employeeId);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const createPerformanceReview = async (req, res, next) => {
  try {
    const { employeeId, employeeName } = req.body;
    if (!employeeId || !employeeName) {
      return res.status(400).json({ success: false, message: 'Employee ID and Employee Name are required' });
    }
    const review = await PerformanceModel.createReview(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const updatePerformanceReview = async (req, res, next) => {
  try {
    const updated = await PerformanceModel.updateReview(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Performance review not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deletePerformanceReview = async (req, res, next) => {
  try {
    const success = await PerformanceModel.deleteReview(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Performance review not found' });
    }
    res.json({ success: true, message: 'Performance review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
