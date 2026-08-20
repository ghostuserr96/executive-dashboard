import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus, MoreHorizontal, MessageSquare, Paperclip, X,
  CheckCircle2, Trash2, Edit3, GripVertical, Calendar,
  User, Flag, AlignLeft, ChevronLeft, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import { taskService } from '../services/taskService';
import { CustomSelect } from '../components/common/CustomSelect';

const COLUMNS = [
  { id: 'To Do',      title: 'To Do',      dotColor: 'bg-slate-400',  headerColor: 'border-slate-400/40', countBg: 'bg-slate-500/20 text-foreground' },
  { id: 'In Progress',title: 'In Progress', dotColor: 'bg-blue-500',   headerColor: 'border-blue-500/40',  countBg: 'bg-blue-500/20 text-blue-300'  },
  { id: 'Review',     title: 'Review',      dotColor: 'bg-amber-500',  headerColor: 'border-amber-500/40', countBg: 'bg-amber-500/20 text-amber-300'},
  { id: 'Done',       title: 'Done',        dotColor: 'bg-emerald-500',headerColor: 'border-emerald-500/40',countBg: 'bg-emerald-500/20 text-emerald-300'},
];

const PRIORITY_STYLES = {
  Urgent: 'bg-red-500/15 text-red-400 border border-red-500/25',
  High:   'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  Medium: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  Low:    'bg-slate-500/15 text-muted-foreground border border-slate-500/25',
};

const PRIORITY_DOT = {
  Urgent: 'bg-red-400',
  High:   'bg-orange-400',
  Medium: 'bg-blue-400',
  Low:    'bg-slate-400',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function TaskCard({ task, onDragStart, onDragEnd, onClick, onMove }) {
  const isDone = task.status === 'Done';
  
  const colIndex = COLUMNS.findIndex(col => col.id === task.status);
  const canMoveLeft = colIndex > 0;
  const canMoveRight = colIndex < COLUMNS.length - 1;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className="group bg-card border border-border/60 rounded-xl p-4 space-y-3 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 select-none"
      style={{ userSelect: 'none' }}
    >
      {/* Top row: move buttons + priority */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5">
          <button 
            type="button"
            disabled={!canMoveLeft}
            onClick={(e) => { e.stopPropagation(); onMove(task, -1); }} 
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer" 
            title="Move Left">
            <ChevronLeft className="w-4 h-4"/>
          </button>
          <button 
            type="button"
            disabled={!canMoveRight}
            onClick={(e) => { e.stopPropagation(); onMove(task, 1); }} 
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer" 
            title="Move Right">
            <ChevronRight className="w-4 h-4"/>
          </button>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium}`}>
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <h4 className={`text-sm font-semibold leading-snug group-hover:text-primary transition-colors ${isDone ? 'line-through text-muted-foreground' : ''}`}>
        {task.title}
      </h4>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Progress</span>
          <span className="font-semibold">{task.progress ?? 0}%</span>
        </div>
        <div className="w-full bg-secondary/80 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-primary'}`}
            style={{ width: `${task.progress ?? 0}%` }}
          />
        </div>
      </div>

      {/* Footer: comments, attachments, avatar, due date */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {task.comments ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5" />
            {task.attachments ?? 0}
          </span>
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {task.assignedToAvatar ? (
          <img
            src={task.assignedToAvatar}
            alt={task.assignedTo}
            title={task.assignedTo}
            className="w-6 h-6 rounded-full border border-border object-cover"
          />
        ) : (
          <div
            title={task.assignedTo}
            className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary"
          >
            {(task.assignedTo || '?')[0]?.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Task Detail / Edit Modal ─────────────────────────────────────────────────
function TaskModal({ task, employees, onClose, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState({ ...task });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(task.id, form);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
      setIsDeleting(false);
    }
  };

  const assigneeOptions = employees.map(e => ({ label: e.name, value: e.name, avatar: e.avatar }));

  return (
    <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[form.priority] || 'bg-slate-400'}`} />
            <span className="text-xs font-mono text-muted-foreground font-semibold">T-{task.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlignLeft className="w-3.5 h-3.5" /> Task Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-background/80 border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
              />
            ) : (
              <p className="text-base font-semibold text-foreground">{form.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlignLeft className="w-3.5 h-3.5" /> Description
            </label>
            {isEditing ? (
              <textarea
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Add a description..."
                className="w-full px-3 py-2 bg-background/80 border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none resize-none"
              />
            ) : (
              <p className="text-sm text-foreground leading-relaxed">
                {form.description || <span className="text-muted-foreground italic">No description</span>}
              </p>
            )}
          </div>

          {/* Grid: Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Flag className="w-3.5 h-3.5" /> Status
              </label>
              {isEditing ? (
                <CustomSelect
                  options={COLUMNS.map(c => ({ label: c.title, value: c.id }))}
                  value={form.status}
                  onChange={val => setForm({ ...form, status: val, progress: val === 'Done' ? 100 : form.progress })}
                />
              ) : (
                <span className="text-sm text-foreground font-medium">{form.status}</span>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Flag className="w-3.5 h-3.5" /> Priority
              </label>
              {isEditing ? (
                <CustomSelect
                  options={['Urgent','High','Medium','Low'].map(p => ({ label: p, value: p }))}
                  value={form.priority}
                  onChange={val => setForm({ ...form, priority: val })}
                />
              ) : (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITY_STYLES[form.priority] || PRIORITY_STYLES.Medium}`}>
                  {form.priority}
                </span>
              )}
            </div>
          </div>

          {/* Grid: Assignee + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5" /> Assignee
              </label>
              {isEditing ? (
                <CustomSelect
                  options={assigneeOptions.length ? assigneeOptions : [{ label: form.assignedTo, value: form.assignedTo }]}
                  value={form.assignedTo}
                  onChange={val => {
                    const emp = employees.find(e => e.name === val);
                    setForm({ ...form, assignedTo: val, assignedToAvatar: emp?.avatar || form.assignedToAvatar });
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  {form.assignedToAvatar ? (
                    <img src={form.assignedToAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : null}
                  <span className="text-sm text-foreground">{form.assignedTo || '—'}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5" /> Due Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={form.dueDate || ''}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-background/80 border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                />
              ) : (
                <span className="text-sm text-foreground">{form.dueDate ? formatDate(form.dueDate) : '—'}</span>
              )}
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex justify-between">
              <span>Progress</span>
              <span className="text-foreground font-bold">{form.progress ?? 0}%</span>
            </label>
            {isEditing ? (
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress ?? 0}
                onChange={e => setForm({ ...form, progress: Number(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
            ) : (
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${form.status === 'Done' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${form.progress ?? 0}%` }}
                />
              </div>
            )}
          </div>

          {/* Timestamps */}
          {!isEditing && (
            <div className="text-[11px] text-muted-foreground space-y-1 pt-2 border-t border-border/40">
              {form.createdAt && <p>Created: {new Date(form.createdAt).toLocaleString()}</p>}
              {form.updatedAt && <p>Last updated: {new Date(form.updatedAt).toLocaleString()}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-border/50 bg-card/80">
            <button
              onClick={() => { setIsEditing(false); setForm({ ...task }); }}
              className="px-4 py-2 border border-border text-foreground rounded-xl text-sm hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-foreground font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create Task Modal ────────────────────────────────────────────────────────
function CreateTaskModal({ employees, onClose, onCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: employees[0]?.name || '',
    assignedToAvatar: employees[0]?.avatar || '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: new Date().toISOString().split('T')[0],
    progress: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreated(form);
      onClose();
    } catch (err) {
      alert('Failed to create task: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const assigneeOptions = employees.map(e => ({ label: e.name, value: e.name }));

  return (
    <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div>
            <h2 className="text-lg font-bold text-foreground">Create New Task</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Assign deliverables to team members</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Task Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Conduct Q3 Security Audit"
              className="w-full px-3 py-2 bg-background/80 border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Brief task description..."
              className="w-full px-3 py-2 bg-background/80 border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Assignee + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <CustomSelect
                label="Assignee"
                options={assigneeOptions.length ? assigneeOptions : [{ label: 'Unassigned', value: '' }]}
                value={form.assignedTo}
                onChange={val => {
                  const emp = employees.find(e => e.name === val);
                  setForm({ ...form, assignedTo: val, assignedToAvatar: emp?.avatar || '' });
                }}
              />
            </div>
            <div>
              <CustomSelect
                label="Priority"
                options={['Urgent','High','Medium','Low'].map(p => ({ label: p, value: p }))}
                value={form.priority}
                onChange={val => setForm({ ...form, priority: val })}
              />
            </div>
          </div>

          {/* Status + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <CustomSelect
                label="Status"
                options={COLUMNS.map(c => ({ label: c.title, value: c.id }))}
                value={form.status}
                onChange={val => setForm({ ...form, status: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Due Date</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-background/80 border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border text-foreground rounded-xl text-sm hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Plus className="w-4 h-4" /> Create Task</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Tasks Page ──────────────────────────────────────────────────────────
export default function Tasks() {
  const { tasks, employees, refreshAll } = useDataContext();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const location = useLocation();
  useEffect(() => {
    if (location.state?.autoOpenQuickAdd) {
      setIsCreateOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Drag state
  const dragTaskRef = useRef(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };
  const showError   = (msg) => { setErrorMsg(msg);   setTimeout(() => setErrorMsg(''), 5000); };

  // ── Drag and Drop handlers ───────────────────────────────────────────────
  const handleDragStart = useCallback((e, task) => {
    dragTaskRef.current = task;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(task.id));
  }, []);

  const handleDragEnd = useCallback(() => {
    dragTaskRef.current = null;
    setIsDragging(false);
    setDragOverCol(null);
  }, []);

  const handleDragOver = useCallback((e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  }, []);

  const handleDrop = useCallback(async (e, colId) => {
    e.preventDefault();
    setDragOverCol(null);
    const task = dragTaskRef.current;
    if (!task || task.status === colId) return;

    // Optimistic UI update via refreshAll won't show immediately, so we do silent refresh after call
    try {
      await taskService.updateStatus(task.id, colId);
      await refreshAll(true);
      showSuccess(`"${task.title}" moved to ${colId}`);
    } catch (err) {
      showError('Failed to move task: ' + err.message);
    }
    dragTaskRef.current = null;
    setIsDragging(false);
  }, [refreshAll]);

  const handleMoveTask = useCallback(async (task, direction) => {
    const currentIndex = COLUMNS.findIndex(col => col.id === task.status);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const newStatus = COLUMNS[newIndex].id;
      try {
        await taskService.updateStatus(task.id, newStatus);
        await refreshAll(true);
        showSuccess(`"${task.title}" moved to ${newStatus}`);
      } catch (err) {
        showError('Failed to move task: ' + err.message);
      }
    }
  }, [refreshAll]);

  // ── CRUD Handlers ────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    await taskService.create(formData);
    await refreshAll(true);
    showSuccess('Task created successfully!');
  };

  const handleSaveTask = async (id, formData) => {
    await taskService.update(id, formData);
    await refreshAll(true);
    // Update selectedTask to reflect saved state
    setSelectedTask(prev => ({ ...prev, ...formData }));
    showSuccess('Task updated!');
  };

  const handleDeleteTask = async (id) => {
    await taskService.delete(id);
    await refreshAll(true);
    setSelectedTask(null);
    showSuccess('Task deleted.');
  };

  // Group tasks by column status and sort by priority
  const PRIORITY_WEIGHT = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  const columnTasks = COLUMNS.reduce((acc, col) => {
    acc[col.id] = (tasks || [])
      .filter(t => t.status === col.id)
      .sort((a, b) => {
        // 1. Sort by Priority (Highest first)
        const weightA = PRIORITY_WEIGHT[a.priority] || 0;
        const weightB = PRIORITY_WEIGHT[b.priority] || 0;
        if (weightA !== weightB) return weightB - weightA;
        // 2. If priorities are the same, sort by Due Date (Soonest first)
        const dateA = new Date(a.dueDate || '2099-12-31').getTime();
        const dateB = new Date(b.dueDate || '2099-12-31').getTime();
        return dateA - dateB;
      });
    return acc;
  }, {});

  const totalTasks = (tasks || []).length;

  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1800px] p-4 lg:p-8 space-y-6 animate-fade-in">

        {/* Banners */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm animate-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Work Management</div>
            <h1 className="truncate text-3xl font-semibold tracking-tight">Task Kanban</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track employee goals, HR projects, and team deliverables.
              <span className="ml-2 text-xs text-muted-foreground/60">({totalTasks} tasks total)</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 rounded-full text-sm font-semibold transition-colors shadow-lg cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create Task
            </button>
          </div>
        </div>

        {/* Drag hint */}
        <p className="text-xs text-muted-foreground/50 flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5" />
          Drag cards between columns to change status • Click a card to view details
        </p>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {COLUMNS.map((col) => {
            const colTasks = columnTasks[col.id] || [];
            const isOver = dragOverCol === col.id && isDragging;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`
                  rounded-2xl border flex flex-col space-y-3 transition-all duration-200
                  ${isOver
                    ? 'border-primary/60 bg-primary/5 shadow-lg shadow-primary/10 scale-[1.01]'
                    : 'border-border/50 bg-muted/30'}
                `}
                style={{ minHeight: 200, padding: '1rem' }}
              >
                {/* Column header */}
                <div className={`flex items-center justify-between px-1 pb-2 border-b ${col.headerColor}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shadow-sm`} />
                    <h3 className="font-semibold text-sm">{col.title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countBg}`}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={`Add to ${col.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Task cards */}
                <div className="space-y-3 flex-1">
                  {colTasks.length === 0 ? (
                    <div className={`
                      rounded-xl border-2 border-dashed flex items-center justify-center text-xs text-muted-foreground/40 font-medium
                      transition-all duration-200
                      ${isOver ? 'border-primary/40 text-primary/50 bg-primary/5 h-20' : 'border-border/30 h-16'}
                    `}>
                      {isOver ? 'Drop here' : 'No tasks'}
                    </div>
                  ) : (
                    colTasks.map((task, idx) => (
                      <TaskCard
                        key={`task-${task.id}-${idx}`}
                        task={task}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onClick={setSelectedTask}
                        onMove={handleMoveTask}
                      />
                    ))
                  )}
                  {/* Drop zone indicator when dragging over non-empty column */}
                  {isOver && colTasks.length > 0 && (
                    <div className="h-12 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center text-xs text-primary/60 font-medium">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateOpen && (
        <CreateTaskModal
          employees={employees || []}
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleCreate}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          employees={employees || []}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </main>
  );
}
