import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { config } from '../config/env.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const isValidEmail = (email) => {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  if (normalized.length > 254) return false;
  return EMAIL_REGEX.test(normalized);
};

export class AuthService {
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  static async signup({ name, email, password, role, department }) {
    if (!name || !email || !password) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Please provide name, email, and password');
    }

    const trimmedName = String(name).trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Name must be between 2 and 100 characters long');
    }

    if (!isValidEmail(email)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Please enter a valid email address (e.g. name@example.com)');
    }

    const normalizedEmail = normalizeEmail(email);

    if (password.length < 6) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Password must be at least 6 characters long');
    }

    if (password.length > 128) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Password must not exceed 128 characters');
    }

    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'An account with this email already exists');
    }

    const cleanRole = role ? String(role).trim() : 'employee';
    const cleanDepartment = department ? String(department).trim() : 'General';

    const user = await UserModel.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      role: cleanRole,
      department: cleanDepartment
    });
    const token = this.generateToken(user);

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar
    };

    return { user: userPayload, token };
  }

  static async login({ email, password }) {
    if (!email || !password) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Please enter email and password');
    }

    if (!isValidEmail(email)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Please enter a valid email address');
    }

    const normalizedLoginEmail = normalizeEmail(email);

    const user = await UserModel.findByEmail(normalizedLoginEmail);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const isMatch = await UserModel.matchPassword(password, user.password);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const token = this.generateToken(user);
    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar
    };

    return { user: userPayload, token };
  }

  static async getUserProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User profile not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      mustChangePassword: !!user.mustChangePassword
    };
  }

  static async updateUserProfile(userId, updateData) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User profile not found');
    }

    const { rtdb } = await import('../config/db.js');
    const updatedUser = { ...user };
    if (updateData.name !== undefined) updatedUser.name = updateData.name;
    if (updateData.department !== undefined) updatedUser.department = updateData.department;
    if (updateData.avatar !== undefined) updatedUser.avatar = updateData.avatar;
    updatedUser.updatedAt = new Date().toISOString();

    const snap = await rtdb.ref('users').get();
    if (snap.exists()) {
      const data = snap.val();
      let fbKey = null;
      for (const key in data) {
        if (String(data[key].id) === String(user.id)) {
          fbKey = key;
          break;
        }
      }
      if (fbKey) {
        await rtdb.ref(`users/${fbKey}`).update(updatedUser);
      } else {
        await rtdb.ref(`users/${user.id}`).update(updatedUser);
      }
    } else {
      await rtdb.ref(`users/${user.id}`).update(updatedUser);
    }

    // If the user happens to be an employee, update the employee record as well
    try {
      const { EmployeeModel } = await import('../models/Employee.js');
      const employee = await EmployeeModel.findByEmail(user.email);
      if (employee) {
        await EmployeeModel.update(employee.id, {
          name: updatedUser.name,
          department: updatedUser.department,
          avatar: updatedUser.avatar
        });
      }
    } catch (err) {
      // Ignore if employee update fails
    }

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      avatar: updatedUser.avatar
    };
  }

  static async changePassword({ userId, currentPassword, newPassword }) {
    if (!userId || !newPassword) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Please provide user ID and new password');
    }
    if (newPassword.length < 6) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'New password must be at least 6 characters long');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User account not found');
    }

    if (currentPassword) {
      const isMatch = await UserModel.matchPassword(currentPassword, user.password);
      if (!isMatch) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Current password is incorrect');
      }
    }

    await UserModel.updatePassword(userId, newPassword);
    return { success: true, message: 'Password updated successfully' };
  }
}
