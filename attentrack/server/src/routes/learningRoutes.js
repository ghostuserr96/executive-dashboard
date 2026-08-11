import { Router } from 'express';
import {
  getStats,
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  getEnrollments, enrollEmployee, updateProgress,
  getLessons, getLesson, createLesson, updateLesson, deleteLesson
} from '../controllers/learningController.js';

const router = Router();

// Stats
router.get('/stats', getStats);

// Courses CRUD
router.get('/courses', getCourses);
router.get('/courses/:id', getCourse);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.patch('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Lessons CRUD (nested under course)
router.get('/courses/:courseId/lessons', getLessons);
router.get('/courses/:courseId/lessons/:lessonId', getLesson);
router.post('/courses/:courseId/lessons', createLesson);
router.patch('/courses/:courseId/lessons/:lessonId', updateLesson);
router.delete('/courses/:courseId/lessons/:lessonId', deleteLesson);

// Enrollments
router.get('/enrollments', getEnrollments);
router.post('/courses/:courseId/enroll', enrollEmployee);

// Complete a lesson (marks done and recalculates progress)
router.patch('/enrollments/:enrollmentId/complete-lesson', updateProgress);

export default router;
