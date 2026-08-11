import { EmployeeService } from '../services/employee.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await EmployeeService.getAllEmployees();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, employees, 'Employees retrieved successfully'));
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.getEmployeeById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, employee, 'Employee profile fetched'));
});

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.createEmployee(req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, employee, 'Employee created successfully'));
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const updated = await EmployeeService.updateEmployee(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, 'Employee updated successfully'));
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  await EmployeeService.deleteEmployee(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Employee removed successfully'));
});
