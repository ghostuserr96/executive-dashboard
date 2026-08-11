import { LearningModel } from '../models/Learning.js';

/* ─── STATS ─── */
export const getStats = async (req, res, next) => {
  try {
    const stats = await LearningModel.getStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

/* ─── COURSES ─── */
export const getCourses = async (req, res, next) => {
  try {
    const courses = await LearningModel.findAllCourses();
    // Attach enrollment counts per course from enrollments collection
    res.json({ success: true, count: courses.length, data: courses });
  } catch (err) { next(err); }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await LearningModel.findCourseById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (err) { next(err); }
};

export const createCourse = async (req, res, next) => {
  try {
    const { title, category } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Course title is required' });
    const course = await LearningModel.createCourse(req.body);
    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (err) { next(err); }
};

export const updateCourse = async (req, res, next) => {
  try {
    const updated = await LearningModel.updateCourse(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const deleted = await LearningModel.deleteCourse(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) { next(err); }
};

/* ─── ENROLLMENTS ─── */
export const getEnrollments = async (req, res, next) => {
  try {
    const { employeeId } = req.query;
    const enrollments = employeeId
      ? await LearningModel.findEnrollmentsByEmployee(employeeId)
      : await LearningModel.findAllEnrollments();
    res.json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) { next(err); }
};

export const enrollEmployee = async (req, res, next) => {
  try {
    const { employeeId, employeeName } = req.body;
    if (!employeeId) return res.status(400).json({ success: false, message: 'employeeId is required' });

    const course = await LearningModel.findCourseById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const enrollment = await LearningModel.enrollEmployee({
      courseId: req.params.courseId,
      employeeId,
      employeeName
    });
    res.status(201).json({ success: true, message: 'Enrolled successfully', data: enrollment });
  } catch (err) { next(err); }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) return res.status(400).json({ success: false, message: 'lessonId is required' });
    const updated = await LearningModel.completeLesson(req.params.enrollmentId, lessonId);
    if (!updated) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    res.json({
      success: true,
      message: updated.certificateIssued ? 'Course completed! Certificate issued 🎓' : 'Lesson marked complete',
      data: updated
    });
  } catch (err) { next(err); }
};

/* ─── LESSONS ─── */
export const getLessons = async (req, res, next) => {
  try {
    const lessons = await LearningModel.findLessonsByCourse(req.params.courseId);
    res.json({ success: true, count: lessons.length, data: lessons });
  } catch (err) { next(err); }
};

export const getLesson = async (req, res, next) => {
  try {
    const lesson = await LearningModel.findLessonById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.json({ success: true, data: lesson });
  } catch (err) { next(err); }
};

export const createLesson = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Lesson title is required' });
    const course = await LearningModel.findCourseById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const lesson = await LearningModel.createLesson(req.params.courseId, req.body);
    res.status(201).json({ success: true, message: 'Lesson added', data: lesson });
  } catch (err) { next(err); }
};

export const updateLesson = async (req, res, next) => {
  try {
    const updated = await LearningModel.updateLesson(req.params.lessonId, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

export const deleteLesson = async (req, res, next) => {
  try {
    const deleted = await LearningModel.deleteLesson(req.params.lessonId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (err) { next(err); }
};
