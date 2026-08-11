import { DepartmentService, TeamService } from '../services/department.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await DepartmentService.getAllDepartments();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, departments, 'Departments retrieved successfully'));
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await DepartmentService.getDepartmentById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, department, 'Department fetched'));
});

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await DepartmentService.createDepartment(req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, department, 'Department created successfully'));
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const updated = await DepartmentService.updateDepartment(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, 'Department updated successfully'));
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const result = await DepartmentService.deleteDepartment(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, 'Department deleted successfully'));
});

export const getTeams = asyncHandler(async (req, res) => {
  const teams = await TeamService.getAllTeams();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, teams, 'Teams retrieved successfully'));
});

export const getTeamById = asyncHandler(async (req, res) => {
  const team = await TeamService.getTeamById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, team, 'Team fetched'));
});

export const getTeamsByDepartment = asyncHandler(async (req, res) => {
  const teams = await TeamService.getTeamsByDepartment(req.params.departmentId);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, teams, 'Teams retrieved successfully'));
});

export const createTeam = asyncHandler(async (req, res) => {
  const team = await TeamService.createTeam(req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, team, 'Team created successfully'));
});

export const updateTeam = asyncHandler(async (req, res) => {
  const updated = await TeamService.updateTeam(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, 'Team updated successfully'));
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const result = await TeamService.deleteTeam(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, 'Team deleted successfully'));
});
