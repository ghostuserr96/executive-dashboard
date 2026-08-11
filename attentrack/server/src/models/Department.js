import { rtdb } from '../config/db.js';
import { EmployeeModel } from './Employee.js';
import { generateId } from '../utils/generateId.js';

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

const _refGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  return snap.exists() ? snap.val() : null;
};

export const DepartmentModel = {
  findAll: async () => {
    return await listGet('departments');
  },

  findById: async (id) => {
    return await _refGet(`departments/${id}`);
  },

  findByName: async (name) => {
    const all = await listGet('departments');
    return all.find((d) => d.name.toLowerCase() === name.toLowerCase()) || null;
  },

  create: async (data) => {
     const id = `dept_${generateId()}`;
    const trimmedName = String(data.name || '').trim();
    if (trimmedName.length < 2) {
      throw new Error('Department name must be at least 2 characters');
    }

    const existing = await DepartmentModel.findByName(trimmedName);
    if (existing) {
      throw new Error(`Department "${trimmedName}" already exists`);
    }

    const department = {
      id,
      name: trimmedName,
      description: data.description || '',
      headId: data.headId || null,
      location: data.location || '',
      color: data.color || '#3b82f6',
      createdAt: new Date().toISOString()
    };

    await rtdb.ref(`departments/${id}`).set(department);
    return department;
  },

  update: async (id, updateData) => {
    const existing = await DepartmentModel.findById(id);
    if (!existing) return null;

    const finalUpdate = { ...updateData };
    if (finalUpdate.name) {
      const trimmed = String(finalUpdate.name).trim();
      if (trimmed.length < 2) {
        throw new Error('Department name must be at least 2 characters');
      }
      const dup = await DepartmentModel.findByName(trimmed);
      if (dup && dup.id !== id) {
        throw new Error(`Department "${trimmed}" already exists`);
      }
      finalUpdate.name = trimmed;
    }

    const updated = { ...existing, ...finalUpdate };
    await rtdb.ref(`departments/${id}`).set(updated);
    return updated;
  },

  delete: async (id) => {
    const existing = await DepartmentModel.findById(id);
    if (!existing) return false;

    const teams = await TeamModel.findByDepartment(id);
    if (teams.length > 0) {
      throw new Error('Cannot delete department with existing teams. Delete teams first.');
    }

    await rtdb.ref(`departments/${id}`).remove();
    return true;
  },

  getStats: async (id) => {
    const teams = await TeamModel.findByDepartment(id);
    let totalEmployees = 0;
    let activeEmployees = 0;

    for (const team of teams) {
      const emps = await EmployeeModel.findByTeam(team.id);
      totalEmployees += emps.length;
      activeEmployees += emps.filter((e) => e.status === 'Active').length;
    }

    return { totalEmployees, activeEmployees, teamCount: teams.length };
  }
};

export const TeamModel = {
  findAll: async () => {
    return await listGet('teams');
  },

  findById: async (id) => {
    return await _refGet(`teams/${id}`);
  },

  findByDepartment: async (departmentId) => {
    const all = await listGet('teams');
    return all.filter((t) => String(t.departmentId) === String(departmentId));
  },

  create: async (data) => {
     const id = `team_${generateId()}`;
    const trimmedName = String(data.name || '').trim();
    if (trimmedName.length < 2) {
      throw new Error('Team name must be at least 2 characters');
    }

    const department = await DepartmentModel.findById(data.departmentId);
    if (!department) {
      throw new Error('Department not found');
    }

    const newTeam = {
      id,
      name: trimmedName,
      departmentId: data.departmentId,
      leadId: data.leadId || null,
      description: data.description || '',
      createdAt: new Date().toISOString()
    };

    await rtdb.ref(`teams/${id}`).set(newTeam);
    return newTeam;
  },

  update: async (id, updateData) => {
    const existing = await TeamModel.findById(id);
    if (!existing) return null;

    const finalUpdate = { ...updateData };
    if (finalUpdate.departmentId) {
      const dept = await DepartmentModel.findById(finalUpdate.departmentId);
      if (!dept) {
        throw new Error('Department not found');
      }
    }

    const updated = { ...existing, ...finalUpdate };
    await rtdb.ref(`teams/${id}`).set(updated);
    return updated;
  },

  delete: async (id) => {
    const existing = await TeamModel.findById(id);
    if (!existing) return false;

    const employees = await EmployeeModel.findByTeam(id);
    if (employees.length > 0) {
      throw new Error('Cannot delete team with assigned employees. Reassign employees first.');
    }

    await rtdb.ref(`teams/${id}`).remove();
    return true;
  },

  getStats: async (id) => {
    const emps = await EmployeeModel.findByTeam(id);
    return {
      totalEmployees: emps.length,
      activeEmployees: emps.filter((e) => e.status === 'Active').length
    };
  }
};
