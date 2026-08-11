import { rtdb } from '../config/db.js';
import { generateId } from '../utils/generateId.js';

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

export const PerformanceModel = {
  findAll: async (filter = {}) => {
    let reviews = await listGet('performance');
    if (filter.employeeId) {
      reviews = reviews.filter((item) => String(item.employeeId) === String(filter.employeeId));
    }
    if (filter.department) {
      reviews = reviews.filter((item) => (item.department || '').toLowerCase() === filter.department.toLowerCase());
    }
    return reviews;
  },

  findByEmployeeId: async (employeeId) => {
    const all = await listGet('performance');
    return all.filter((item) => String(item.employeeId) === String(employeeId));
  },

  findById: async (id) => {
    const all = await listGet('performance');
    return all.find((item) => String(item.id) === String(id)) || null;
  },

  createReview: async (reviewData) => {
    const overall = Number(reviewData.overallScore) || Math.round(
      ((Number(reviewData.goalCompletion) || 80) +
       (Number(reviewData.discipline) || 80) +
       (Number(reviewData.learning) || 80) +
       (Number(reviewData.leadership) || 80) +
       (Number(reviewData.communication) || 80) +
       (Number(reviewData.innovation) || 80)) / 6
    );
    const id = generateId();
    const newReview = {
      id,
      status: 'Completed',
      updatedAt: new Date().toISOString(),
      ...reviewData,
      overallScore: Math.min(100, Math.max(0, overall))
    };
    await rtdb.ref(`performance/${id}`).set(newReview);
    return newReview;
  },

  updateReview: async (id, updateData) => {
    const all = await listGet('performance');
    const review = all.find((item) => String(item.id) === String(id));
    if (!review) return null;
    const updated = { ...review, ...updateData, updatedAt: new Date().toISOString() };
    await rtdb.ref(`performance/${review.id}`).set(updated);
    return updated;
  },

  deleteReview: async (id) => {
    const all = await listGet('performance');
    const review = all.find((item) => String(item.id) === String(id));
    if (!review) return false;
    await rtdb.ref(`performance/${review.id}`).remove();
    return true;
  }
};
