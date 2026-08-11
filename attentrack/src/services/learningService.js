import { apiClient } from './apiClient';

export const learningService = {
  getStats:    ()       => apiClient('/learning/stats'),

  // Courses
  getCourses:  ()       => apiClient('/learning/courses'),
  getCourse:   (id)     => apiClient(`/learning/courses/${id}`),
  createCourse:(data)   => apiClient('/learning/courses',     { method: 'POST',  body: data }),
  updateCourse:(id, d)  => apiClient(`/learning/courses/${id}`, { method: 'PATCH', body: d }),
  deleteCourse:(id)     => apiClient(`/learning/courses/${id}`, { method: 'DELETE' }),

  // Lessons
  getLessons:   (courseId)              => apiClient(`/learning/courses/${courseId}/lessons`),
  createLesson: (courseId, data)        => apiClient(`/learning/courses/${courseId}/lessons`, { method: 'POST', body: data }),
  updateLesson: (courseId, lessonId, d) => apiClient(`/learning/courses/${courseId}/lessons/${lessonId}`, { method: 'PATCH', body: d }),
  deleteLesson: (courseId, lessonId)    => apiClient(`/learning/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' }),

  // Enrollments
  getEnrollments:   (employeeId) => apiClient(`/learning/enrollments${employeeId ? `?employeeId=${employeeId}` : ''}`),
  enrollEmployee:   (courseId, payload) => apiClient(`/learning/courses/${courseId}/enroll`, { method: 'POST', body: payload }),
  completeLesson:   (enrollmentId, lessonId) =>
    apiClient(`/learning/enrollments/${enrollmentId}/complete-lesson`, { method: 'PATCH', body: { lessonId } }),
};
