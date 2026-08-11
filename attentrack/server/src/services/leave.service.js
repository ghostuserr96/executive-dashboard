import { LeaveModel } from '../models/Leave.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export class LeaveService {
  static async getLeaveRequests() {
    return await LeaveModel.findAll();
  }

  static async submitLeaveRequest(data) {
    if (!data.startDate || !data.endDate || !data.type) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Start date, end date, and leave type are required');
    }
    return await LeaveModel.createRequest(data);
  }

  static async updateLeaveStatus(id, status) {
    const updated = await LeaveModel.updateStatus(id, status);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Leave request with ID ${id} not found`);
    }
    return updated;
  }
}
