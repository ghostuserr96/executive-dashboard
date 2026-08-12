import { EmployeeModel } from '../models/Employee.js';
import { UserModel } from '../models/User.model.js';
import { rtdb } from '../config/db.js';
import { deleteFromCloudinary } from './cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export class EmployeeService {
  static async getAllEmployees() {
    return await EmployeeModel.findAll();
  }

  static async getEmployeeById(id) {
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Employee with ID ${id} not found`);
    }
    return employee;
  }

  static async createEmployee(data) {
    if (!data.name || !data.email) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Employee name and email are required');
    }

    const employee = await EmployeeModel.create(data);

    // Automatically create user login account so employee can log in immediately
    const existingUser = await UserModel.findByEmail(data.email);
    if (!existingUser) {
      await UserModel.create({
        name: data.name,
        email: data.email,
        password: data.password || '123456',
        role: data.role || 'employee',
        department: data.department || 'Engineering',
        avatar: data.avatar
      });
    }

    return employee;
  }

  static async updateEmployee(id, updateData) {
    const existingEmployee = await EmployeeModel.findById(id);
    if (!existingEmployee) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Employee with ID ${id} not found`);
    }
    const oldEmail = existingEmployee.email;

    const updated = await EmployeeModel.update(id, updateData);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Employee with ID ${id} not found`);
    }

    // Sync avatar & info to User account if user exists, or create user account
    const emailToSearch = oldEmail || updated.email;
    if (emailToSearch) {
      const user = await UserModel.findByEmail(emailToSearch);
      if (user) {
        const updatedUser = { ...user };
        if (updateData.email) updatedUser.email = updateData.email;
        if (updateData.avatar) updatedUser.avatar = updateData.avatar;
        if (updateData.name) updatedUser.name = updateData.name;
        if (updateData.department) updatedUser.department = updateData.department;
        await rtdb.ref(`users/${user.id}`).update(updatedUser);
      } else if (updated.email) {
        await UserModel.create({
          name: updated.name,
          email: updated.email,
          password: '123456',
          role: updated.role || 'employee',
          department: updated.department || 'Engineering',
          avatar: updated.avatar
        });
      }
    }

    return updated;
  }

  static async deleteEmployee(id) {
    // Fetch employee first to clean up Cloudinary avatar
    let employee = null;
    try { employee = await EmployeeModel.findById(id); } catch (_) {}

    const success = await EmployeeModel.delete(id);
    if (!success) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Employee with ID ${id} not found`);
    }

    // Clean up avatar from Cloudinary if it's a Cloudinary URL
    if (employee?.avatar && employee.avatar.includes('res.cloudinary.com')) {
      try {
        // Extract publicId from URL: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<publicId>.<ext>
        const match = employee.avatar.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/);
        if (match && match[1]) {
          await deleteFromCloudinary(match[1], 'image');
        }
      } catch (err) {
        console.warn(`[EmployeeService] Could not delete avatar from Cloudinary: ${err.message}`);
      }
    }

    return true;
  }
}
