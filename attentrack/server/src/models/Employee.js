import { rtdb } from '../config/db.js';
import { generateId } from '../utils/generateId.js';

const VALID_STATUSES = ['Active', 'Inactive', 'On Leave', 'Terminated'];

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

const _refGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  return snap.exists() ? snap.val() : null;
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const isValidEmail = (email) => {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  if (normalized.length > 254) return false;
  return EMAIL_REGEX.test(normalized);
};

export const EmployeeModel = {
  findAll: async () => {
    return await listGet('employees');
  },

  findById: async (id) => {
    const all = await listGet('employees');
    return all.find((emp) => String(emp.id) === String(id)) || _refGet(`employees/${id}`);
  },

  findByEmail: async (email) => {
    if (!isValidEmail(email)) return null;
    const normalized = normalizeEmail(email);
    const all = await listGet('employees');
    return all.find((emp) => normalizeEmail(emp.email) === normalized) || null;
  },

  findByTeam: async (teamId) => {
    const all = await listGet('employees');
    return all.filter((emp) => String(emp.teamId) === String(teamId));
  },

  findByManager: async (managerId) => {
    const all = await listGet('employees');
    return all.filter((emp) => String(emp.managerId) === String(managerId));
  },

   create: async (employeeData) => {
    const id = generateId();

    if (employeeData.email) {
      if (!isValidEmail(employeeData.email)) {
        throw new Error(`Invalid employee email format: ${employeeData.email}`);
      }
      const dup = await EmployeeModel.findByEmail(employeeData.email);
      if (dup) {
        throw new Error(`Employee with email ${normalizeEmail(employeeData.email)} already exists`);
      }
    }

    const trimmedName = String(employeeData.name || '').trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      throw new Error('Employee name must be between 2 and 100 characters long');
    }

    const cleanStatus = employeeData.status && VALID_STATUSES.includes(employeeData.status)
      ? employeeData.status
      : 'Active';

    const isValidDate = (d) => {
      if (!d) return false;
      const parsed = new Date(d);
      return !isNaN(parsed.getTime());
    };

    const newEmp = {
      id,
      skills: [],
      dob: null,
      joinDate: isValidDate(employeeData.joinDate) ? new Date(employeeData.joinDate).toISOString().split('T')[0] : (new Date().toISOString().split('T')[0]),
      ...employeeData,
      name: trimmedName,
      email: employeeData.email ? normalizeEmail(employeeData.email) : '',
      status: cleanStatus,
      teamId: employeeData.teamId || null,
      managerId: employeeData.managerId || null,
      level: employeeData.level || 'Individual',
      dob: isValidDate(employeeData.dob) ? new Date(employeeData.dob).toISOString().split('T')[0] : null,
      performanceRating: Number(employeeData.performanceRating) || 0,
      baseSalary: Number(employeeData.baseSalary) || 0,
      attendanceScore: Number(employeeData.attendanceScore) || 0,
      tenure: Number(employeeData.tenure) || 0
    };
    await rtdb.ref(`employees/${id}`).set(newEmp);
    return newEmp;
  },

  update: async (id, updateData) => {
    const snap = await rtdb.ref('employees').get();
    if (!snap.exists()) return null;
    
    const data = snap.val();
    let fbKey = null;
    let emp = null;
    
    // Find the correct Firebase key by matching the id
    for (const key in data) {
      if (String(data[key].id) === String(id)) {
        fbKey = key;
        emp = data[key];
        break;
      }
    }
    
    if (!emp) return null;

    const finalUpdate = { ...updateData };

    if (finalUpdate.email) {
      if (!isValidEmail(finalUpdate.email)) {
        throw new Error(`Invalid employee email format: ${finalUpdate.email}`);
      }
      const normalized = normalizeEmail(finalUpdate.email);
      const currentEmail = normalizeEmail(emp.email);
      if (normalized !== currentEmail) {
        // Check for duplicates
        let isDup = false;
        for (const key in data) {
          if (key !== fbKey && normalizeEmail(data[key].email) === normalized) {
            isDup = true;
            break;
          }
        }
        if (isDup) {
          throw new Error(`Another employee with email ${normalized} already exists`);
        }
      }
      finalUpdate.email = normalized;
    }

    if (finalUpdate.name) {
      const trimmed = String(finalUpdate.name).trim();
      if (trimmed.length < 2 || trimmed.length > 100) {
        throw new Error('Employee name must be between 2 and 100 characters long');
      }
      finalUpdate.name = trimmed;
    }

    if (finalUpdate.status && !VALID_STATUSES.includes(finalUpdate.status)) {
      throw new Error(`Invalid employee status: ${finalUpdate.status}`);
    }

    const isValidDate = (d) => {
      if (!d) return false;
      const parsed = new Date(d);
      return !isNaN(parsed.getTime());
    };

    if (finalUpdate.dob !== undefined) {
      finalUpdate.dob = isValidDate(finalUpdate.dob) ? new Date(finalUpdate.dob).toISOString().split('T')[0] : null;
    }
    if (finalUpdate.joinDate !== undefined) {
      finalUpdate.joinDate = isValidDate(finalUpdate.joinDate) ? new Date(finalUpdate.joinDate).toISOString().split('T')[0] : emp.joinDate || (new Date().toISOString().split('T')[0]);
    }

    const updated = { ...emp, ...finalUpdate };
    await rtdb.ref(`employees/${fbKey}`).set(updated);
    return updated;
  },

  delete: async (id) => {
    const snap = await rtdb.ref('employees').get();
    if (!snap.exists()) return false;
    
    const data = snap.val();
    let fbKey = null;
    
    for (const key in data) {
      if (String(data[key].id) === String(id)) {
        fbKey = key;
        break;
      }
    }
    
    if (!fbKey) return false;
    await rtdb.ref(`employees/${fbKey}`).remove();
    return true;
  }
};
