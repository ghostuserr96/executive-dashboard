import { AttendanceService } from '../services/attendance.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export const getAttendanceLogs = asyncHandler(async (req, res) => {
  const logs = await AttendanceService.getAttendanceLogs();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, logs, 'Attendance logs fetched successfully'));
});

export const clockIn = asyncHandler(async (req, res) => {
  const log = await AttendanceService.clockIn(req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, log, 'Successfully clocked in'));
});

export const markAttendance = asyncHandler(async (req, res) => {
  const log = await AttendanceService.markAttendance(req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, log, 'Attendance marked successfully with selfie snapshot and location'));
});

export const clockOut = asyncHandler(async (req, res) => {
  const updatedLog = await AttendanceService.clockOut(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updatedLog, 'Successfully clocked out'));
});
