import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, PlayCircle, Award, Clock, Play, Plus, Trash2,
  RefreshCw, X, Edit3, CheckCircle2, Users, ChevronRight,
  Loader2, ArrowLeft, Link2, FileText, Tv2, MonitorPlay,
  ExternalLink, Check, AlertCircle
} from 'lucide-react';
import { learningService } from '../services/learningService';
import { useAuth } from '../context/AuthContext';

/* ─── Constants ─── */
const CATEGORY_OPTIONS = ['Engineering','Leadership','Product','Design','Compliance','HR','Finance','Managers','General'];
const GRADIENT_MAP = {
  Engineering:'from-blue-600 to-sky-400', Leadership:'from-purple-600 to-violet-400',
  Product:'from-emerald-600 to-teal-400', Design:'from-pink-600 to-rose-400',
  Compliance:'from-orange-600 to-amber-400', HR:'from-cyan-600 to-sky-400',
  Finance:'from-green-700 to-emerald-400', Managers:'from-indigo-600 to-blue-400',
  General:'from-slate-600 to-slate-400',
};
const EMPTY_COURSE = { title:'', category:'Engineering', description:'', duration:'', badge:null, status:'Active' };
const EMPTY_LESSON = { title:'', description:'', contentUrl:'', attachments:[] };

/* ─── Resource type utils ─── */
function getYoutubeEmbed(url) {
  const regexps = [/youtu\.be\/([a-zA-Z0-9_-]{11})/, /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/, /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/];
  for (const re of regexps) { const m = url?.match(re); if (m) return `https://www.youtube.com/embed/${m[1]}`; }
  return null;
}
function getDriveEmbed(url) {
  const m = url?.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
}
function detectType(url) {
  if (!url) return 'link';
  if (/youtu\.?be/.test(url))                           return 'youtube';
  if (/drive\.google\.com/.test(url))                   return 'drive';
  if (/loom\.com/.test(url))                            return 'loom';
  if (/docs\.google\.com\/document/.test(url))          return 'googledoc';
  if (/docs\.google\.com\/presentation/.test(url))      return 'googleslides';
  if (/docs\.google\.com\/spreadsheets/.test(url))      return 'googlesheet';
  if (/\.pdf$/i.test(url))                              return 'pdf';
  return 'link';
}
function ResourceIcon({ type, className = 'w-4 h-4' }) {
  if (type === 'youtube') return <Tv2 className={className} />;
  if (type === 'drive')   return <MonitorPlay className={className} />;
  if (type === 'loom')    return <PlayCircle className={className} />;
  if (type === 'pdf' || type === 'googledoc' || type === 'googleslides' || type === 'googlesheet')
    return <FileText className={className} />;
  return <Link2 className={className} />;
}

/* ─── Lesson Player ─── */
function LessonPlayer({ lesson }) {
  const url = lesson.contentUrl;
  const type = lesson.resourceType || detectType(url);
  const yt = type === 'youtube' ? getYoutubeEmbed(url) : null;
  const drive = type === 'drive' ? getDriveEmbed(url) : null;

  if (!url) return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3 bg-muted/20 rounded-2xl">
      <AlertCircle className="w-10 h-10" />
      <p className="text-sm">No content URL added for this lesson.</p>
    </div>
  );

  if (yt) return (
    <div className="rounded-2xl overflow-hidden aspect-video w-full bg-black">
      <iframe src={yt} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={lesson.title} />
    </div>
  );

  if (drive) return (
    <div className="rounded-2xl overflow-hidden aspect-video w-full bg-black">
      <iframe src={drive} className="w-full h-full" allow="autoplay" title={lesson.title} />
    </div>
  );

  if (type === 'loom') {
    const loomId = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1];
    if (loomId) return (
      <div className="rounded-2xl overflow-hidden aspect-video w-full bg-black">
        <iframe src={`https://www.loom.com/embed/${loomId}`} className="w-full h-full" allowFullScreen title={lesson.title} />
      </div>
    );
  }

  // For all other types: show a big open-link card
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex flex-col items-center justify-center gap-4 h-48 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors cursor-pointer group">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
        <ResourceIcon type={type} className="w-7 h-7 text-primary" />
      </div>
      <div className="text-center">
        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{lesson.title}</p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-center">
          Open resource <ExternalLink className="w-3 h-3" />
        </p>
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function Learning() {
  const { user } = useAuth();
  const [courses, setCourses]         = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);
  const [submitting, setSubmitting]   = useState(false);

  // Views: 'grid' | 'course' (course detail + lessons)
  const [view, setView]               = useState('grid');
  const [activeCourse, setActiveCourse] = useState(null);
  const [lessons, setLessons]         = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editCourse, setEditCourse]   = useState(null);
  const [courseForm, setCourseForm]   = useState(EMPTY_COURSE);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editLesson, setEditLesson]   = useState(null);
  const [lessonForm, setLessonForm]   = useState(EMPTY_LESSON);

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4500); };

  /* ─── Load all ─── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, eRes, sRes] = await Promise.all([
        learningService.getCourses(),
        learningService.getEnrollments(user?.employeeId || user?.id),
        learningService.getStats()
      ]);
      setCourses(cRes?.data || []);
      setEnrollments(eRes?.data || []);
      setStats(sRes?.data || null);
    } catch (err) { console.error('[Learning] load error:', err.message); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const getEnrollment = (courseId) => enrollments.find(e => String(e.courseId) === String(courseId));

  /* ─── Open course detail ─── */
  const openCourse = async (course) => {
    setActiveCourse(course);
    setActiveLesson(null);
    setView('course');
    setLessonsLoading(true);
    try {
      const res = await learningService.getLessons(course.id);
      const sorted = (res?.data || []).sort((a,b)=>(a.order||0)-(b.order||0));
      setLessons(sorted);
      if (sorted.length > 0) setActiveLesson(sorted[0]);
    } catch (err) { console.error('[Learning] lessons error:', err.message); }
    finally { setLessonsLoading(false); }
  };

  /* ─── Enroll ─── */
  const handleEnroll = async (courseId) => {
    try {
      await learningService.enrollEmployee(courseId, {
        employeeId: user?.employeeId || user?.id || 'guest',
        employeeName: user?.name || user?.email || 'User'
      });
      showToast('Enrolled successfully!');
      load();
    } catch (err) { showToast('Failed to enroll', 'error'); }
  };

  /* ─── Complete lesson ─── */
  const handleCompleteLesson = async (lesson) => {
    const enrollment = getEnrollment(activeCourse?.id);
    if (!enrollment) { await handleEnroll(activeCourse?.id); return; }
    try {
      const res = await learningService.completeLesson(enrollment.id, lesson.id);
      showToast(res?.message || 'Lesson complete ✓');
      // Update enrollments locally
      setEnrollments(prev => prev.map(e => String(e.id) === String(enrollment.id) ? res.data : e));
    } catch (err) { showToast('Error saving progress', 'error'); }
  };

  /* ─── Course CRUD ─── */
  const openCreateCourse = () => { setCourseForm(EMPTY_COURSE); setEditCourse(null); setShowCourseModal(true); };
  const openEditCourse = (c, e) => { e.stopPropagation(); setCourseForm({ title:c.title, category:c.category, description:c.description, duration:c.duration, badge:c.badge, status:c.status||'Active' }); setEditCourse(c); setShowCourseModal(true); };
  const saveCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editCourse) { await learningService.updateCourse(editCourse.id, courseForm); showToast('Course updated'); }
      else { await learningService.createCourse(courseForm); showToast('Course created'); }
      setShowCourseModal(false); setEditCourse(null); load();
    } catch { showToast('Failed to save', 'error'); }
    finally { setSubmitting(false); }
  };
  const handleDeleteCourse = async (c, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${c.title}"? All lessons and enrollments will be removed.`)) return;
    try { await learningService.deleteCourse(c.id); showToast('Deleted'); load(); }
    catch { showToast('Failed to delete', 'error'); }
  };

  /* ─── Lesson CRUD ─── */
  const openAddLesson = () => { setLessonForm(EMPTY_LESSON); setEditLesson(null); setShowLessonModal(true); };
  const openEditLesson = (l) => { setLessonForm({ title:l.title, description:l.description, contentUrl:l.contentUrl, attachments:l.attachments||[] }); setEditLesson(l); setShowLessonModal(true); };
  const saveLesson = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editLesson) {
        await learningService.updateLesson(activeCourse.id, editLesson.id, lessonForm);
        showToast('Lesson updated');
      } else {
        await learningService.createLesson(activeCourse.id, lessonForm);
        showToast('Lesson added');
      }
      setShowLessonModal(false); setEditLesson(null);
      const res = await learningService.getLessons(activeCourse.id);
      const sorted = (res?.data||[]).sort((a,b)=>(a.order||0)-(b.order||0));
      setLessons(sorted);
      if (!editLesson && sorted.length > 0) setActiveLesson(sorted[sorted.length-1]);
    } catch { showToast('Failed to save lesson', 'error'); }
    finally { setSubmitting(false); }
  };
  const handleDeleteLesson = async (l) => {
    if (!window.confirm(`Delete lesson "${l.title}"?`)) return;
    try {
      await learningService.deleteLesson(activeCourse.id, l.id);
      showToast('Lesson deleted');
      const res = await learningService.getLessons(activeCourse.id);
      const sorted = (res?.data||[]).sort((a,b)=>(a.order||0)-(b.order||0));
      setLessons(sorted);
      if (String(activeLesson?.id) === String(l.id)) setActiveLesson(sorted[0] || null);
      load();
    } catch { showToast('Failed to delete', 'error'); }
  };

  /* ─────────── STATS ─────────── */
  const statCards = [
    { title:'Courses', value: stats?.coursesInFlight ?? '—', icon:<BookOpen className="h-5 w-5 text-blue-500"/>, bg:'bg-blue-50 dark:bg-blue-500/10' },
    { title:'Enrolled', value: stats?.learnersActive ?? '—', icon:<Users className="h-5 w-5 text-green-500"/>, bg:'bg-green-50 dark:bg-green-500/10' },
    { title:'Certificates', value: stats?.certificatesIssued ?? '—', icon:<Award className="h-5 w-5 text-amber-500"/>, bg:'bg-amber-50 dark:bg-amber-500/10' },
    { title:'Avg Progress', value: stats?.avgWeeklyTime ?? '—', icon:<Clock className="h-5 w-5 text-cyan-500"/>, bg:'bg-cyan-50 dark:bg-cyan-500/10' },
  ];

  /* ════════════════════════════════════════
     COURSE GRID VIEW
  ════════════════════════════════════════ */
  if (view === 'grid') return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${toast.type==='error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'}`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />{toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-500">Learning & Development</div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Learning</h1>
            <p className="mt-1 text-sm text-muted-foreground">Courses, certifications and skill development for every teammate.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={load} className="flex items-center gap-2 bg-background border border-border text-foreground hover:bg-muted h-10 px-4 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-sm whitespace-nowrap">
              <RefreshCw className="h-4 w-4 text-primary" /> Refresh
            </button>
            <button onClick={openCreateCourse} className="flex items-center gap-2 bg-blue-600 text-foreground hover:bg-blue-700 h-10 px-5 rounded-full text-sm font-semibold transition-all shadow-md cursor-pointer whitespace-nowrap">
              <Plus className="h-4 w-4" /> Add Course
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s,i) => (
            <div key={i} className="card-elevated p-5 flex items-center gap-4">
              <div className={`p-3 rounded-2xl border border-border/50 ${s.bg}`}>{s.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.title}</p>
                <p className="text-2xl font-bold text-foreground">{loading ? '—' : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-7 h-7 animate-spin mr-3" /> Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <BookOpen className="w-9 h-9 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No courses yet</h3>
            <p className="text-sm text-muted-foreground mb-5">Add the first course with lessons and resources.</p>
            <button onClick={openCreateCourse} className="flex items-center gap-2 bg-blue-600 text-foreground hover:bg-blue-700 h-10 px-5 rounded-full text-sm font-semibold cursor-pointer">
              <Plus className="h-4 w-4" /> Add First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map(course => {
              const enrollment = getEnrollment(course.id);
              const gradient = GRADIENT_MAP[course.category] || GRADIENT_MAP.General;
              return (
                <div key={course.id} onClick={() => openCourse(course)}
                  className="card-elevated hover-lift flex flex-col overflow-hidden group cursor-pointer">
                  <div className={`h-44 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
                    {course.badge && (
                      <div className="absolute top-4 left-4 bg-background/90 dark:bg-background/90 text-foreground px-3 py-1 text-xs font-bold rounded-full shadow-sm">{course.badge}</div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => openEditCourse(course, e)} className="p-1.5 bg-background/20 hover:bg-background/40 rounded-lg backdrop-blur-sm cursor-pointer" title="Edit"><Edit3 className="w-3.5 h-3.5 text-foreground"/></button>
                      <button onClick={e => handleDeleteCourse(course, e)} className="p-1.5 bg-background/20 hover:bg-rose-500/60 rounded-lg backdrop-blur-sm cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5 text-foreground"/></button>
                    </div>
                    <div className="w-14 h-14 rounded-full border-2 border-white/30 flex items-center justify-center bg-black/10 group-hover:bg-black/20 group-hover:scale-110 transition-all backdrop-blur-sm">
                      <Play className="h-6 w-6 text-foreground ml-1 fill-white"/>
                    </div>
                    {/* lesson count badge */}
                    {(course.lessonCount > 0) && (
                      <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {course.lessonCount} lessons
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1 bg-card">
                    <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{course.category}</div>
                    <h3 className="font-bold text-base mb-1 line-clamp-1 text-foreground">{course.title}</h3>
                    <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                      {course.duration && <span>{course.duration}</span>}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {course.enrolled||0} enrolled</span>
                    </div>
                    {course.description && <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{course.description}</p>}
                    <div className="mt-auto">
                      {enrollment ? (
                        <>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-bold">{enrollment.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-blue-600 rounded-full" style={{width:`${enrollment.progress}%`}}/>
                          </div>
                          {enrollment.certificateIssued ? (
                            <div className="w-full py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-center flex items-center justify-center gap-2">
                              <Award className="w-4 h-4"/> Certificate Earned
                            </div>
                          ) : (
                            <div className="w-full py-2.5 text-sm font-bold text-foreground bg-blue-600 rounded-full text-center flex items-center justify-center gap-2">
                              Continue <ChevronRight className="w-4 h-4"/>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full py-2.5 text-sm font-bold text-foreground bg-blue-600 rounded-full text-center">
                          Open Course
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Course Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <button onClick={() => { setShowCourseModal(false); setEditCourse(null); }} className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:bg-muted rounded-full cursor-pointer"><X className="w-5 h-5"/></button>
              <h2 className="text-xl font-bold text-foreground mb-4">{editCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <form onSubmit={saveCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Title *</label>
                  <input required value={courseForm.title} onChange={e=>setCourseForm({...courseForm,title:e.target.value})} placeholder="e.g. Advanced React Patterns" className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Category</label>
                    <select value={courseForm.category} onChange={e=>setCourseForm({...courseForm,category:e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none h-[38px]">
                      {CATEGORY_OPTIONS.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Duration</label>
                    <input value={courseForm.duration} onChange={e=>setCourseForm({...courseForm,duration:e.target.value})} placeholder="e.g. 4h 30m" className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Badge</label>
                    <select value={courseForm.badge||''} onChange={e=>setCourseForm({...courseForm,badge:e.target.value||null})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm h-[38px]">
                      <option value="">None</option>
                      {['Featured','New','Mandatory'].map(b=><option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</label>
                    <select value={courseForm.status} onChange={e=>setCourseForm({...courseForm,status:e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm h-[38px]">
                      <option>Active</option><option>Draft</option><option>Archived</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</label>
                  <textarea rows={3} value={courseForm.description} onChange={e=>setCourseForm({...courseForm,description:e.target.value})} placeholder="Brief overview..." className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none resize-none"/>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={()=>setShowCourseModal(false)} className="px-4 py-2 border border-border text-foreground hover:bg-muted font-medium rounded-xl text-sm cursor-pointer">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-foreground font-semibold rounded-xl text-sm cursor-pointer disabled:opacity-60">
                    {submitting ? 'Saving...' : (editCourse ? 'Save Changes' : 'Create Course')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );

  /* ════════════════════════════════════════
     COURSE DETAIL VIEW (Lesson Player)
  ════════════════════════════════════════ */
  const enrollment = getEnrollment(activeCourse?.id);
  const completedSet = new Set(enrollment?.completedLessons || []);
  const gradient = GRADIENT_MAP[activeCourse?.category] || GRADIENT_MAP.General;

  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${toast.type==='error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0"/>{toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
        {/* Back button */}
        <button onClick={() => { setView('grid'); setActiveCourse(null); setActiveLesson(null); }}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-5 cursor-pointer transition-colors">
          <ArrowLeft className="w-4 h-4"/> Back to Courses
        </button>

        <div className="flex flex-col xl:flex-row gap-6">

          {/* LEFT: Lesson Player */}
          <div className="flex-1 min-w-0">
            {/* Course header banner */}
            <div className={`h-14 rounded-2xl bg-gradient-to-r ${gradient} flex items-center px-5 mb-5`}>
              <div>
                <p className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">{activeCourse?.category}</p>
                <h1 className="text-foreground font-bold text-lg leading-tight">{activeCourse?.title}</h1>
              </div>
              {enrollment?.certificateIssued && (
                <div className="ml-auto flex items-center gap-2 bg-background/20 text-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                  <Award className="w-4 h-4"/> Certificate Earned
                </div>
              )}
            </div>

            {/* Progress bar */}
            {enrollment && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Your progress</span>
                  <span className="font-bold text-foreground">{enrollment.progress}% ({completedSet.size}/{lessons.length} lessons)</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{width:`${enrollment.progress}%`}}/>
                </div>
              </div>
            )}

            {/* Content Player */}
            {lessonsLoading ? (
              <div className="flex items-center justify-center h-64"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground"/></div>
            ) : activeLesson ? (
              <div className="space-y-4">
                <LessonPlayer lesson={activeLesson}/>
                <div>
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{activeLesson.title}</h2>
                      {activeLesson.description && <p className="text-sm text-muted-foreground mt-1">{activeLesson.description}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEditLesson(activeLesson)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors" title="Edit lesson">
                        <Edit3 className="w-4 h-4"/>
                      </button>
                      <button onClick={() => handleDeleteLesson(activeLesson)} className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 cursor-pointer transition-colors" title="Delete lesson">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>

                  {/* Attachments */}
                  {activeLesson.attachments?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attachments</p>
                      {activeLesson.attachments.map((att, i) => (
                        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-xl hover:bg-muted transition-colors text-sm text-foreground font-medium cursor-pointer">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0"/>
                          {att.label || att.url}
                          <ExternalLink className="w-3.5 h-3.5 ml-auto text-muted-foreground"/>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-5 flex items-center gap-3">
                    {completedSet.has(String(activeLesson.id)) ? (
                      <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl text-sm">
                        <Check className="w-4 h-4"/> Completed
                      </div>
                    ) : (
                      <button onClick={() => handleCompleteLesson(activeLesson)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-foreground font-bold rounded-xl text-sm cursor-pointer transition-colors">
                        <Check className="w-4 h-4"/> Mark as Complete
                      </button>
                    )}
                    {/* Next lesson */}
                    {(() => { const idx = lessons.findIndex(l=>l.id===activeLesson.id); const next=lessons[idx+1]; return next ? (
                      <button onClick={()=>setActiveLesson(next)} className="flex items-center gap-2 px-5 py-2.5 border border-border text-foreground hover:bg-muted font-bold rounded-xl text-sm cursor-pointer transition-colors">
                        Next: {next.title} <ChevronRight className="w-4 h-4"/>
                      </button>
                    ) : null; })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                <BookOpen className="w-10 h-10 text-muted-foreground"/>
                <p className="text-muted-foreground text-sm">No lessons added yet.</p>
                <button onClick={openAddLesson} className="flex items-center gap-2 bg-blue-600 text-foreground hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer">
                  <Plus className="w-4 h-4"/> Add First Lesson
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Lesson Sidebar */}
          <div className="xl:w-80 shrink-0">
            <div className="card-elevated p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-sm">Course Content</h3>
                <button onClick={openAddLesson} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  <Plus className="w-3.5 h-3.5"/> Add Lesson
                </button>
              </div>

              {!enrollment && (
                <button onClick={() => handleEnroll(activeCourse?.id)} className="w-full py-2.5 mb-4 bg-blue-600 hover:bg-blue-700 text-foreground text-sm font-bold rounded-xl cursor-pointer transition-colors">
                  Enroll to Track Progress
                </button>
              )}

              {lessonsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/></div>
              ) : lessons.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No lessons yet. Add one above.</p>
              ) : (
                <div className="space-y-1.5">
                  {lessons.map((lesson, idx) => {
                    const isDone = completedSet.has(String(lesson.id));
                    const isActive = String(activeLesson?.id) === String(lesson.id);
                    const type = lesson.resourceType || detectType(lesson.contentUrl);
                    return (
                      <button key={lesson.id} onClick={() => setActiveLesson(lesson)}
                        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${isActive ? 'bg-blue-600 text-foreground' : 'hover:bg-muted text-foreground'}`}>
                        <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border ${isDone ? 'bg-emerald-500 border-emerald-500 text-foreground' : isActive ? 'border-white/40 text-foreground/80' : 'border-border text-muted-foreground'}`}>
                          {isDone ? <Check className="w-3.5 h-3.5"/> : idx+1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold truncate ${isActive ? 'text-foreground' : 'text-foreground'}`}>{lesson.title}</p>
                          <p className={`text-[10px] flex items-center gap-1 mt-0.5 ${isActive ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                            <ResourceIcon type={type} className="w-3 h-3"/>{type}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Lesson Add/Edit Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button onClick={()=>{setShowLessonModal(false);setEditLesson(null);}} className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:bg-muted rounded-full cursor-pointer"><X className="w-5 h-5"/></button>
            <h2 className="text-xl font-bold text-foreground mb-1">{editLesson ? 'Edit Lesson' : 'Add Lesson'}</h2>
            <p className="text-xs text-muted-foreground mb-5">Paste any URL — YouTube, Loom, PDF, Notion...</p>
            <form onSubmit={saveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Lesson Title *</label>
                <input required value={lessonForm.title} onChange={e=>setLessonForm({...lessonForm,title:e.target.value})} placeholder="e.g. Introduction to Hooks" className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Resource URL</label>
                <input value={lessonForm.contentUrl} onChange={e=>setLessonForm({...lessonForm,contentUrl:e.target.value})} placeholder="https://youtu.be/... or https://loom.com/..." className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none font-mono"/>
                {lessonForm.contentUrl && (
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <ResourceIcon type={detectType(lessonForm.contentUrl)} className="w-3.5 h-3.5"/>
                    Detected: <span className="font-semibold text-foreground">{detectType(lessonForm.contentUrl)}</span>
                    {getYoutubeEmbed(lessonForm.contentUrl) && ' · Will embed as video'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description / Notes</label>
                <textarea rows={3} value={lessonForm.description} onChange={e=>setLessonForm({...lessonForm,description:e.target.value})} placeholder="Brief description, key points, or instructions..." className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none resize-none"/>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowLessonModal(false)} className="px-4 py-2 border border-border text-foreground hover:bg-muted font-medium rounded-xl text-sm cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-foreground font-semibold rounded-xl text-sm cursor-pointer disabled:opacity-60">
                  {submitting ? 'Saving...' : (editLesson ? 'Save Changes' : 'Add Lesson')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
