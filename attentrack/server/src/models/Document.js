import { rtdb } from '../config/db.js';
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

export const DocumentModel = {
  findAll: async () => {
    return await listGet('documents');
  },

  findById: async (id) => {
    return await _refGet(`documents/${id}`);
  },

  findByFolder: async (folder) => {
    const all = await listGet('documents');
    return all.filter((doc) => doc.folder === folder);
  },

  findByEmployee: async (employeeId) => {
    const all = await listGet('documents');
    return all.filter((doc) => String(doc.uploadedBy) === String(employeeId));
  },

  create: async (docData) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newDoc = {
      id,
      name: docData.name,
      folder: docData.folder || 'General',
      size: docData.size || 0,
      url: docData.url || '',
      publicId: docData.publicId || '',
      mimeType: docData.mimeType || '',
      uploadedBy: docData.uploadedBy || '',
      uploadedByName: docData.uploadedByName || '',
      description: docData.description || '',
      status: docData.status || 'Active',
      createdAt: now,
      updatedAt: now,
      ...docData,
      id
    };
    await rtdb.ref(`documents/${id}`).set(newDoc);
    return newDoc;
  },

  update: async (id, updateData) => {
    const existing = await DocumentModel.findById(id);
    if (!existing) return null;
    const updated = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
    await rtdb.ref(`documents/${id}`).set(updated);
    return updated;
  },

  delete: async (id) => {
    const existing = await DocumentModel.findById(id);
    if (!existing) return false;
    await rtdb.ref(`documents/${id}`).remove();
    return true;
  }
};