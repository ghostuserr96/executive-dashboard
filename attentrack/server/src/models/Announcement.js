import { rtdb } from '../config/db.js';
import { generateId } from '../utils/generateId.js';

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

const _getById = async (id) => {
  const all = await listGet('announcements');
  return all.find((a) => String(a.id) === String(id)) || null;
};

export const AnnouncementModel = {
  findAll: async () => {
    const list = await listGet('announcements');
    return list.sort((a, b) => {
      if (!!b.isPinned !== !!a.isPinned) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  },

  findById: async (id) => {
    return await _getById(id);
  },

  create: async (data) => {
    const id = data.id || generateId();
    const now = new Date();
    const newAnnouncement = {
      date: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      likes: 0,
      likedBy: [],
      comments: [],
      isPinned: false,
      ...data,
      id
    };
    await rtdb.ref(`announcements/${id}`).set(newAnnouncement);
    return newAnnouncement;
  },

  update: async (id, updateData) => {
    const existing = await _getById(id);
    if (!existing) return null;
    const updated = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
    await rtdb.ref(`announcements/${existing.id}`).set(updated);
    return updated;
  },

  delete: async (id) => {
    const existing = await _getById(id);
    if (!existing) return false;
    await rtdb.ref(`announcements/${existing.id}`).remove();
    return true;
  },

  togglePin: async (id, isPinned) => {
    return await AnnouncementModel.update(id, { isPinned: !!isPinned });
  },

  toggleLike: async (id, userId) => {
    const existing = await _getById(id);
    if (!existing) return null;
    const likedBy = Array.isArray(existing.likedBy) ? existing.likedBy : [];
    const index = likedBy.indexOf(userId);
    let newLikedBy;
    let likes;
    if (index >= 0) {
      newLikedBy = likedBy.filter(u => u !== userId);
      likes = (existing.likes || 0) - 1;
    } else {
      newLikedBy = [...likedBy, userId];
      likes = (existing.likes || 0) + 1;
    }
    return await AnnouncementModel.update(id, { likedBy: newLikedBy, likes });
  },

  addComment: async (id, commentData) => {
    const existing = await _getById(id);
    if (!existing) return null;
    const comments = Array.isArray(existing.comments) ? existing.comments : [];
    const comment = {
       id: generateId(),
      createdAt: new Date().toISOString(),
      ...commentData
    };
    comments.push(comment);
    await AnnouncementModel.update(id, { comments });
    return comment;
  },

  deleteComment: async (id, commentId) => {
    const existing = await _getById(id);
    if (!existing) return false;
    const comments = (Array.isArray(existing.comments) ? existing.comments : [])
      .filter(c => String(c.id) !== String(commentId));
    await AnnouncementModel.update(id, { comments });
    return true;
  }
};
