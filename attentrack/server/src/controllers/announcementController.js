import { AnnouncementModel } from '../models/Announcement.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const list = await AnnouncementModel.findAll();
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await AnnouncementModel.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await AnnouncementModel.create(req.body);
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await AnnouncementModel.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await AnnouncementModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const togglePin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;
    const updated = await AnnouncementModel.togglePin(id, isPinned);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    const updated = await AnnouncementModel.toggleLike(id, userId);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    const isLiked = Array.isArray(updated.likedBy) && updated.likedBy.includes(userId);
    res.json({ 
      success: true, 
      data: { 
        liked: isLiked, 
        likes: updated.likes, 
        likedBy: updated.likedBy 
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await AnnouncementModel.addComment(id, req.body);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const deleted = await AnnouncementModel.deleteComment(id, commentId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Announcement or comment not found' });
    }
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
