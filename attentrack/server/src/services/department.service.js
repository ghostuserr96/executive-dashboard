import { DepartmentModel, TeamModel } from '../models/Department.js';
import { EmployeeModel } from '../models/Employee.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export class DepartmentService {
  static async getAllDepartments() {
    const departments = await DepartmentModel.findAll();
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const stats = await DepartmentModel.getStats(dept.id);
        const teams = await TeamModel.findByDepartment(dept.id);
        const head = dept.headId ? await EmployeeModel.findById(dept.headId) : null;
        return { ...dept, ...stats, teams, head };
      })
    );
    return enriched;
  }

  static async getDepartmentById(id) {
    const department = await DepartmentModel.findById(id);
    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Department with ID ${id} not found`);
    }
    const stats = await DepartmentModel.getStats(id);
    const teams = await TeamModel.findByDepartment(id);
    const head = department.headId ? await EmployeeModel.findById(department.headId) : null;
    return { ...department, ...stats, teams, head };
  }

  static async createDepartment(data) {
    const department = await DepartmentModel.create(data);
    return department;
  }

  static async updateDepartment(id, updateData) {
    const updated = await DepartmentModel.update(id, updateData);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Department with ID ${id} not found`);
    }
    const stats = await DepartmentModel.getStats(id);
    const teams = await TeamModel.findByDepartment(id);
    return { ...updated, ...stats, teams };
  }

  static async deleteDepartment(id) {
    const success = await DepartmentModel.delete(id);
    if (!success) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Department with ID ${id} not found`);
    }
    return { message: 'Department deleted successfully' };
  }
}

export class TeamService {
  static async getAllTeams() {
    const teams = await TeamModel.findAll();
    const enriched = await Promise.all(
      teams.map(async (team) => {
        const stats = await TeamModel.getStats(team.id);
        const department = await DepartmentModel.findById(team.departmentId);
        const lead = team.leadId ? await EmployeeModel.findById(team.leadId) : null;
        return { ...team, ...stats, department, lead };
      })
    );
    return enriched;
  }

  static async getTeamById(id) {
    const team = await TeamModel.findById(id);
    if (!team) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Team with ID ${id} not found`);
    }
    const stats = await TeamModel.getStats(id);
    const department = await DepartmentModel.findById(team.departmentId);
    const lead = team.leadId ? await EmployeeModel.findById(team.leadId) : null;
    return { ...team, ...stats, department, lead };
  }

  static async getTeamsByDepartment(departmentId) {
    const teams = await TeamModel.findByDepartment(departmentId);
    const enriched = await Promise.all(
      teams.map(async (team) => {
        const stats = await TeamModel.getStats(team.id);
        const lead = team.leadId ? await EmployeeModel.findById(team.leadId) : null;
        return { ...team, ...stats, lead };
      })
    );
    return enriched;
  }

  static async createTeam(data) {
    const team = await TeamModel.create(data);
    const stats = await TeamModel.getStats(team.id);
    const department = await DepartmentModel.findById(team.departmentId);
    return { ...team, ...stats, department };
  }

  static async updateTeam(id, updateData) {
    const updated = await TeamModel.update(id, updateData);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Team with ID ${id} not found`);
    }
    const stats = await TeamModel.getStats(id);
    const department = await DepartmentModel.findById(updated.departmentId);
    return { ...updated, ...stats, department };
  }

  static async deleteTeam(id) {
    const success = await TeamModel.delete(id);
    if (!success) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Team with ID ${id} not found`);
    }
    return { message: 'Team deleted successfully' };
  }
}
