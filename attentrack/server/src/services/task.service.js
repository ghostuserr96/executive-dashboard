import { TaskModel } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export class TaskService {
  static async getTasks() {
    return await TaskModel.findAll();
  }

  static async createTask(data) {
    if (!data.title) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Task title is required');
    }
    return await TaskModel.create(data);
  }

  static async updateTaskStatus(id, status) {
    const updated = await TaskModel.updateStatus(id, status);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Task with ID ${id} not found`);
    }
    return updated;
  }
}
