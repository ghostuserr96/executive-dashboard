import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export const signup = asyncHandler(async (req, res) => {
  const result = await AuthService.signup(req.body);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, result, 'User account registered successfully')
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Successfully logged in')
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const profile = await AuthService.getUserProfile(req.user.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, profile, 'User profile fetched')
  );
});

export const updateMe = asyncHandler(async (req, res) => {
  const updatedProfile = await AuthService.updateUserProfile(req.user.id, req.body);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, updatedProfile, 'User profile updated successfully')
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const result = await AuthService.changePassword({
    userId,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword
  });
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Password changed successfully')
  );
});
