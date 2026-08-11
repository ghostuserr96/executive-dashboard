import { rtdb } from '../config/db.js';

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

const genId = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

/* ─────────────────────────────────────────
   Helper: detect YouTube URL and extract embed
───────────────────────────────────────── */
export const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const regexps = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of regexps) {
    const m = url.match(re);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
};

export const getGoogleDriveEmbedUrl = (url) => {
  if (!url) return null;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) {
    return `https://drive.google.com/file/d/${m[1]}/preview`;
  }
  return null;
};

export const detectResourceType = (url) => {
  if (!url) return 'link';
  if (/youtu\.?be/.test(url)) return 'youtube';
  if (/drive\.google\.com/.test(url)) return 'drive';
  if (/\.pdf$/i.test(url)) return 'pdf';
  if (/docs\.google\.com\/document/.test(url)) return 'googledoc';
  if (/docs\.google\.com\/presentation/.test(url)) return 'googleslides';
  if (/docs\.google\.com\/spreadsheets/.test(url)) return 'googlesheet';
  if (/loom\.com/.test(url)) return 'loom';
  return 'link';
};

export const LearningModel = {

  /* ═══════════════ COURSES ═══════════════ */

  findAllCourses: async () => {
    return await listGet('courses');
  },

  findCourseById: async (id) => {
    const all = await LearningModel.findAllCourses();
    return all.find((c) => String(c.id) === String(id)) || null;
  },

  createCourse: async (data) => {
    const course = {
      id: data.id || genId('course'),
      title: data.title || 'Untitled Course',
      category: data.category || 'General',
      description: data.description || '',
      duration: data.duration || '',
      badge: data.badge || null,
      thumbnail: data.thumbnail || null,
      enrolled: 0,
      lessonCount: 0,
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await rtdb.ref(`courses/${course.id}`).set(course);
    return course;
  },

  updateCourse: async (id, updates) => {
    const course = await LearningModel.findCourseById(id);
    if (!course) return null;
    const updated = { ...course, ...updates, updatedAt: new Date().toISOString() };
    await rtdb.ref(`courses/${id}`).set(updated);
    return updated;
  },

  deleteCourse: async (id) => {
    const course = await LearningModel.findCourseById(id);
    if (!course) return null;
    await rtdb.ref(`courses/${id}`).remove();

    // Delete associated lessons
    const lessons = await listGet('lessons');
    for (const lesson of lessons.filter((l) => String(l.courseId) === String(id))) {
      await rtdb.ref(`lessons/${lesson.id}`).remove();
    }

    // Delete associated enrollments
    const enrollments = await listGet('enrollments');
    for (const enrollment of enrollments.filter((e) => String(e.courseId) === String(id))) {
      await rtdb.ref(`enrollments/${enrollment.id}`).remove();
    }

    return course;
  },

  /* ═══════════════ LESSONS ═══════════════ */

  findLessonsByCourse: async (courseId) => {
    const all = await listGet('lessons');
    return all
      .filter((l) => String(l.courseId) === String(courseId))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  findLessonById: async (id) => {
    const all = await listGet('lessons');
    return all.find((l) => String(l.id) === String(id)) || null;
  },

  createLesson: async (courseId, data) => {
    const courseLessons = await LearningModel.findLessonsByCourse(courseId);
    const url = data.contentUrl || data.resourceUrl || '';
    const lesson = {
      id: data.id || genId('lesson'),
      courseId: String(courseId),
      title: data.title || 'Untitled Lesson',
      description: data.description || '',
      contentUrl: url,
      resourceType: data.resourceType || detectResourceType(url),
      attachments: data.attachments || [],
      order: data.order ?? courseLessons.length,
      isFree: data.isFree ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await rtdb.ref(`lessons/${lesson.id}`).set(lesson);
    await LearningModel.updateCourse(courseId, { lessonCount: courseLessons.length + 1 });
    return lesson;
  },

  updateLesson: async (lessonId, data) => {
    const lesson = await LearningModel.findLessonById(lessonId);
    if (!lesson) return null;
    const url = data.contentUrl || data.resourceUrl;
    const updates = {
      ...data,
      ...(url ? { resourceType: data.resourceType || detectResourceType(url) } : {}),
      updatedAt: new Date().toISOString()
    };
    const updated = { ...lesson, ...updates };
    await rtdb.ref(`lessons/${lessonId}`).set(updated);
    return updated;
  },

  deleteLesson: async (lessonId) => {
    const lesson = await LearningModel.findLessonById(lessonId);
    if (!lesson) return null;
    await rtdb.ref(`lessons/${lessonId}`).remove();
    // Update lessonCount on course
    const remaining = await LearningModel.findLessonsByCourse(lesson.courseId);
    await LearningModel.updateCourse(lesson.courseId, { lessonCount: remaining.length });
    return lesson;
  },

  /* ═══════════════ ENROLLMENTS ═══════════════ */

  findAllEnrollments: async () => {
    return await listGet('enrollments');
  },

  findEnrollmentsByEmployee: async (employeeId) => {
    const all = await LearningModel.findAllEnrollments();
    return all.filter((e) => String(e.employeeId) === String(employeeId));
  },

  findEnrollmentByCourseAndEmployee: async (courseId, employeeId) => {
    const all = await LearningModel.findAllEnrollments();
    return all.find(
      (e) => String(e.courseId) === String(courseId) && String(e.employeeId) === String(employeeId)
    ) || null;
  },

  enrollEmployee: async ({ courseId, employeeId, employeeName }) => {
    const existing = await LearningModel.findEnrollmentByCourseAndEmployee(courseId, employeeId);
    if (existing) return existing;

    const enrollment = {
      id: genId('enr'),
      courseId: String(courseId),
      employeeId: String(employeeId),
      employeeName: employeeName || '',
      completedLessons: [],
      progress: 0,
      completedAt: null,
      certificateIssued: false,
      enrolledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await rtdb.ref(`enrollments/${enrollment.id}`).set(enrollment);

    // Increment course enrolled count
    const course = await LearningModel.findCourseById(courseId);
    if (course) {
      await rtdb.ref(`courses/${courseId}/enrolled`).set((course.enrolled || 0) + 1);
    }

    return enrollment;
  },

  completeLesson: async (enrollmentId, lessonId) => {
    const all = await LearningModel.findAllEnrollments();
    const enrollment = all.find((e) => String(e.id) === String(enrollmentId));
    if (!enrollment) return null;

    const completed = new Set(enrollment.completedLessons || []);
    completed.add(String(lessonId));

    const allLessons = await listGet('lessons');
    const totalLessons = allLessons.filter((l) => String(l.courseId) === String(enrollment.courseId)).length;
    const progress = totalLessons > 0 ? Math.round((completed.size / totalLessons) * 100) : 0;
    const isDone = progress >= 100;

    const updates = {
      ...enrollment,
      completedLessons: [...completed],
      progress,
      completedAt: isDone ? new Date().toISOString() : null,
      certificateIssued: isDone,
      updatedAt: new Date().toISOString()
    };

    await rtdb.ref(`enrollments/${enrollmentId}`).set(updates);
    return updates;
  },

  /* ═══════════════ STATS ═══════════════ */

  getStats: async () => {
    const courses = await LearningModel.findAllCourses();
    const enrollments = await LearningModel.findAllEnrollments();
    const activeCourses = courses.filter((c) => c.status === 'Active').length;
    const certsIssued = enrollments.filter((e) => e.certificateIssued).length;
    const avgProgress = enrollments.length
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
      : 0;
    return {
      coursesInFlight: activeCourses,
      learnersActive: enrollments.length,
      certificatesIssued: certsIssued,
      avgWeeklyTime: `${avgProgress}% avg`
    };
  }
};
