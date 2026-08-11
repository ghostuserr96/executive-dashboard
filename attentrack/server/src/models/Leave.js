import { rtdb } from '../config/db.js';
import { generateId } from '../utils/generateId.js';

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

export const LeaveModel = {
  findAll: async (filter = {}) => {
    let leaves = await listGet('leaves');
    if (filter.employeeId) {
      leaves = leaves.filter((item) => String(item.employeeId) === String(filter.employeeId));
    }
    if (filter.status) {
      leaves = leaves.filter((item) => item.status.toLowerCase() === filter.status.toLowerCase());
    }
    return leaves;
  },

  findById: async (id) => {
    const all = await listGet('leaves');
    return all.find((item) => String(item.id) === String(id)) || null;
  },

  createRequest: async (leaveData) => {
    let computedDays = Number(leaveData.days);
    if (!computedDays && leaveData.startDate && leaveData.endDate) {
      const start = new Date(leaveData.startDate);
      const end = new Date(leaveData.endDate);
      const diffTime = Math.abs(end - start);
      computedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    if (isNaN(computedDays) || computedDays <= 0) {
      computedDays = 1;
    }
    const id = generateId();
    const newLeave = {
      id,
      status: 'Pending',
      appliedOn: new Date().toISOString(),
      ...leaveData,
      days: computedDays
    };
    await rtdb.ref(`leaves/${id}`).set(newLeave);
    return newLeave;
  },

  updateStatus: async (id, status) => {
    const all = await listGet('leaves');
    const leave = all.find((item) => String(item.id) === String(id));
    if (!leave) return null;
    const updated = { ...leave, status, updatedAt: new Date().toISOString() };
    await rtdb.ref(`leaves/${leave.id}`).set(updated);
    return updated;
  },

  deleteRequest: async (id) => {
    const all = await listGet('leaves');
    const leave = all.find((item) => String(item.id) === String(id));
    if (!leave) return false;
    await rtdb.ref(`leaves/${leave.id}`).remove();
    return true;
  }
};
