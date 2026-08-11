import { rtdb } from '../config/db.js';
import { generateId } from '../utils/generateId.js';

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

export const TaskModel = {
  findAll: async () => {
    return await listGet('tasks');
  },

  findById: async (id) => {
    const all = await listGet('tasks');
    return all.find((t) => String(t.id) === String(id)) || null;
  },

  create: async (taskData) => {
    const id = generateId();
    const newTask = {
      id,
      status: 'To Do',
      priority: 'Medium',
      progress: 0,
      comments: 0,
      attachments: 0,
      description: '',
      assignedTo: '',
      assignedToAvatar: '',
      dueDate: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...taskData,
      id
    };
    await rtdb.ref(`tasks/${id}`).set(newTask);
    return newTask;
  },

  update: async (id, updateData) => {
    const all = await listGet('tasks');
    const task = all.find((t) => String(t.id) === String(id));
    if (!task) return null;
    const updated = { ...task, ...updateData, updatedAt: new Date().toISOString() };
    await rtdb.ref(`tasks/${task.id}`).set(updated);
    return updated;
  },

  updateStatus: async (id, status) => {
    const all = await listGet('tasks');
    const task = all.find((t) => String(t.id) === String(id));
    if (!task) return null;
    const updated = {
      ...task,
      status,
      updatedAt: new Date().toISOString(),
      progress: status === 'Done' && task.progress < 100 ? 100 : task.progress
    };
    await rtdb.ref(`tasks/${task.id}`).set(updated);
    return updated;
  },

  delete: async (id) => {
    const all = await listGet('tasks');
    const task = all.find((t) => String(t.id) === String(id));
    if (!task) return false;
    await rtdb.ref(`tasks/${task.id}`).remove();
    return true;
  }
};
