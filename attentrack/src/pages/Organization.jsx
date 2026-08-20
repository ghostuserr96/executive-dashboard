import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  UserPlus,
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  Briefcase,
  Network,
  Settings2,
  FolderTree,
  Component,
  ArrowRight
} from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import { organizationService } from '../services/organizationService';
import { employeeService } from '../services/employeeService';
import { CustomSelect } from '../components/common/CustomSelect';

const STATUS_COLORS = {
  Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Inactive: 'bg-slate-500/10 text-muted-foreground border-slate-500/20',
  'On Leave': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Terminated: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
};

const LEVEL_ORDER = ['C-Level', 'VP', 'Director', 'Manager', 'Lead', 'Senior', 'Individual'];

const levelColor = (level) => {
  const map = {
    'C-Level': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    VP: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Director: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Manager: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Lead: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    Senior: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Individual: 'bg-slate-500/10 text-muted-foreground border-slate-500/20'
  };
  return map[level] || map['Individual'];
};

const OrgChartNode = ({ node, onEdit, onDelete, onAddChild, employees }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isDept = node.type === 'department' || node.type === 'root';
  const isTeam = node.type === 'team';
  const isEmp = node.type === 'employee';

  return (
    <li>
      <div className="org-node group inline-block mx-2">
        <div className={`flex flex-col items-center justify-center min-w-[140px] max-w-[200px] p-3 rounded-2xl border transition-all shadow-sm relative bg-card ${
            node.type === 'root' ? 'border-primary/30 shadow-primary/10' :
            isDept ? 'border-blue-500/20 shadow-blue-500/5 hover:border-blue-500/40' :
            isTeam ? 'border-cyan-500/20 shadow-cyan-500/5 hover:border-cyan-500/40' :
            'border-slate-500/20 shadow-slate-500/5 hover:border-slate-500/40'
        }`}>
          <div className="flex flex-col items-center">
          {isDept && node.type !== 'root' && <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2"><Component className="w-4 h-4 text-blue-400" /></div>}
          {isTeam && <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-2"><Network className="w-4 h-4 text-cyan-400" /></div>}
          {isEmp && (
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden mb-2 shadow-sm border border-border">
              {node.avatar ? (
                <img src={node.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-foreground">
                  {node.initials || node.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
            </div>
          )}

          <span className="text-sm font-semibold truncate text-foreground w-full text-center block leading-tight">{node.name}</span>
          
          {node.role && <p className="text-xs text-muted-foreground truncate w-full text-center mt-1">{node.role}</p>}
          
          {isEmp && node.level && (
            <div className="mt-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${levelColor(node.level)}`}>
                {node.level}
              </span>
            </div>
          )}

          {/* Action Overlay */}
          <div className="absolute -top-3 -right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded-lg shadow-md p-1 z-10">
            {(!isEmp || node.type === 'employee') && (
              <button onClick={() => onAddChild(node)} className="p-1 rounded hover:bg-emerald-500/10 text-emerald-500 transition-colors cursor-pointer" title="Add">
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            {node.type !== 'root' && (
              <>
                <button onClick={() => onEdit(node)} className="p-1 rounded hover:bg-indigo-500/10 text-indigo-500 transition-colors cursor-pointer" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(node)} className="p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
          </div>
        </div>
      </div>

      {hasChildren && (
        <ul>
          {node.children.map((child) => (
            <OrgChartNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              employees={employees}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function Organization() {
  const { employees: contextEmployees, refreshAll } = useDataContext();
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'departments' | 'teams' | 'employees'
  const [treeViewMode, setTreeViewMode] = useState('people'); // 'people' | 'department'

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  const employees = Array.isArray(contextEmployees) ? contextEmployees : [];

  const fetchOrgData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptRes, teamRes] = await Promise.allSettled([
        organizationService.getAllDepartments(),
        organizationService.getAllTeams()
      ]);
      if (deptRes.status === 'fulfilled' && deptRes.value?.data) setDepartments(deptRes.value.data);
      if (teamRes.status === 'fulfilled' && teamRes.value?.data) setTeams(teamRes.value.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  const buildDepartmentTree = () => {
    const deptNodes = departments.map((dept) => {
      const deptTeams = teams.filter((t) => String(t.departmentId) === String(dept.id));
      const teamChildren = deptTeams.map((t) => {
        const teamEmps = employees.filter((e) => String(e.teamId) === String(t.id));
        return {
          ...t,
          type: 'team',
          children: teamEmps.map((e) => ({ ...e, type: 'employee', children: [] }))
        };
      });

      return {
        ...dept,
        type: 'department',
        children: teamChildren
      };
    });

    return [{ id: 'company-root', name: 'Northwind Labs', type: 'root', children: deptNodes }];
  };

  const buildPeopleTree = () => {
    const empMap = new Map(employees.map(e => [String(e.id), { ...e, type: 'employee', children: [] }]));
    const roots = [];

    employees.forEach(emp => {
      const node = empMap.get(String(emp.id));
      if (emp.managerId && empMap.has(String(emp.managerId))) {
        const parent = empMap.get(String(emp.managerId));
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return [{ id: 'company-root', name: 'Northwind Labs (People)', type: 'root', children: roots }];
  };

  const treeData = useMemo(() => {
    return treeViewMode === 'department' ? buildDepartmentTree() : buildPeopleTree();
  }, [departments, teams, employees, treeViewMode]);

  const openModal = (mode, item = null, initialData = {}) => {
    setModalMode(mode);
    setEditingItem(item);
    setFormData(initialData);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode('create');
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        if (editingItem.type === 'department') {
          await organizationService.updateDepartment(editingItem.id, formData);
        } else if (editingItem.type === 'team') {
          await organizationService.updateTeam(editingItem.id, formData);
        } else if (editingItem.type === 'employee') {
          await employeeService.update(editingItem.id, formData);
        }
      } else {
        if (formData.type === 'department') {
          await organizationService.createDepartment(formData);
        } else if (formData.type === 'team') {
          await organizationService.createTeam(formData);
        } else if (formData.type === 'employee') {
          await employeeService.create(formData);
        }
      }
      await Promise.all([fetchOrgData(), refreshAll()]);
      closeModal();
      setSuccessMsg('Saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (node) => {
    if (!window.confirm(`Delete "${node.name}"? This cannot be undone.`)) return;
    try {
      if (node.type === 'department') {
        await organizationService.deleteDepartment(node.id);
      } else if (node.type === 'team') {
        await organizationService.deleteTeam(node.id);
      } else if (node.type === 'employee') {
        await employeeService.delete(node.id);
      }
      await Promise.all([fetchOrgData(), refreshAll()]);
      setSuccessMsg('Deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const addChildTo = (parent) => {
    if (treeViewMode === 'department') {
      if (parent.type === 'root') {
        openModal('create', null, { type: 'department' });
      } else if (parent.type === 'department') {
        openModal('create', null, { type: 'team', departmentId: parent.id });
      } else if (parent.type === 'team') {
        openModal('create', null, { type: 'employee', teamId: parent.id, departmentId: parent.departmentId });
      }
    } else {
      if (parent.type === 'root') {
        openModal('create', null, { type: 'employee' });
      } else if (parent.type === 'employee') {
        openModal('create', null, { type: 'employee', managerId: parent.id });
      }
    }
  };

  const handleEdit = (node) => {
    let type = node.type;
    if (!type) {
      if (node.email) type = 'employee';
      else if (node.departmentId !== undefined) type = 'team';
      else type = 'department';
    }
    const item = { ...node, type };
    setFormData(item);
    setEditingItem(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const totalEmployees = employees.length;
  const totalDepartments = departments.length;
  const totalTeams = teams.length;

  const ModalContent = () => {
    const isDept = formData.type === 'department';
    const isTeam = formData.type === 'team';
    const isEmp = formData.type === 'employee';
    const title = isDept ? 'Department' : isTeam ? 'Team' : 'Employee';
    const titleAction = editingItem ? 'Edit' : 'Add New';

    const deptOptions = departments.map((d) => ({ label: d.name, value: d.id }));
    const teamOptions = teams.map((t) => ({ label: t.name, value: t.id }));
    const managerOptions = employees.map((e) => ({ label: `${e.name} - ${e.role}`, value: e.id }));
    const deptForTeam = departments.find((d) => d.id === formData.departmentId);

    return (
      <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {titleAction} {title}
          </h3>
          <button type="button" onClick={closeModal} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isEmp && !editingItem?.id && (
          <>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-500" /> Assign Existing Employee
              </label>
              <CustomSelect
                placeholder="-- Select an employee to assign here --"
                value=""
                onChange={(val) => {
                  const emp = employees.find(emp => String(emp.id) === val);
                  if (emp) {
                    setEditingItem({ ...emp, type: 'employee' });
                    setFormData({ ...emp, ...formData, type: 'employee' });
                  }
                }}
                options={[{ label: '-- Select an employee to assign here --', value: '' }, ...employees.map(e => ({ label: `${e.name} • ${e.role}`, value: String(e.id) }))]}
              />
            </div>
            
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px bg-border flex-1"></div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Or Create New Profile</span>
              <div className="h-px bg-border flex-1"></div>
            </div>
          </>
        )}

        {isDept && (
          <>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Department Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                rows="2"
                placeholder="e.g. Responsible for product development and engineering"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Location</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. San Francisco"
              />
            </div>
          </>
        )}

        {isTeam && (
          <>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Team Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. Frontend Squad"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Department *</label>
              <CustomSelect
                placeholder="Select department"
                value={formData.departmentId || ''}
                onChange={(val) => setFormData({ ...formData, departmentId: val })}
                options={[{ label: 'Select department', value: '' }, ...deptOptions]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                rows="2"
                placeholder="e.g. Cross-functional team focused on user experience"
              />
            </div>
          </>
        )}

        {isEmp && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Level</label>
                <CustomSelect
                  value={formData.level || 'Individual'}
                  onChange={(val) => setFormData({ ...formData, level: val })}
                  options={LEVEL_ORDER.map(l => ({ label: l, value: l }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Department</label>
                <CustomSelect
                  placeholder="Select"
                  value={formData.department || ''}
                  onChange={(val) => setFormData({ ...formData, department: val })}
                  options={[{ label: 'Select', value: '' }, ...deptOptions.map(d => ({ label: d.label, value: d.label }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Team</label>
                <CustomSelect
                  placeholder="Select"
                  value={formData.teamId || ''}
                  onChange={(val) => setFormData({ ...formData, teamId: val || null })}
                  options={[{ label: 'Select', value: '' }, ...teamOptions]}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Reports To (Manager)</label>
              <CustomSelect
                placeholder="None (Top level)"
                value={formData.managerId || ''}
                onChange={(val) => setFormData({ ...formData, managerId: val || null })}
                options={[{ label: 'None (Top level)', value: '' }, ...managerOptions]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
              <CustomSelect
                value={formData.status || 'Active'}
                onChange={(val) => setFormData({ ...formData, status: val })}
                options={[
                  { label: 'Active', value: 'Active' },
                  { label: 'Inactive', value: 'Inactive' },
                  { label: 'On Leave', value: 'On Leave' },
                  { label: 'Terminated', value: 'Terminated' }
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate || ''}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 border border-border text-foreground rounded-xl text-sm hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-foreground font-medium rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <main className="flex-1 min-w-0 overflow-y-auto bg-background/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading organization structure...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        {successMsg && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Header */}
        <div className="pt-2 flex flex-col gap-4 md:flex-row md:items-end justify-between">
          <div>
            <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-2">Organization</div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Org Structure</h1>
            <p className="text-[15px] text-muted-foreground">Manage departments, teams, and reporting hierarchy. Everything is editable in real-time.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openModal('create', null, { type: 'department' })}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Component className="w-4 h-4" />
              Add Department
            </button>
            <button
                onClick={() => openModal('create', null, { type: 'employee' })}
              className="inline-flex items-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-elevated p-5 border border-border rounded-2xl bg-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Component className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalDepartments}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Departments</div>
            </div>
          </div>
          <div className="card-elevated p-5 border border-border rounded-2xl bg-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalTeams}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Teams</div>
            </div>
          </div>
          <div className="card-elevated p-5 border border-border rounded-2xl bg-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalEmployees}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Employees</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 border-b border-border">
          {[
            { key: 'tree', label: 'Org Chart', icon: FolderTree },
            { key: 'departments', label: `Departments (${totalDepartments})`, icon: Component },
            { key: 'teams', label: `Teams (${totalTeams})`, icon: Network },
            { key: 'employees', label: `Employees (${totalEmployees})`, icon: Users },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tree View */}
        {activeTab === 'tree' && (
          <div className="card-elevated border border-border rounded-2xl bg-card p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[15px] text-card-foreground flex items-center gap-2">
                <Network className="w-4 h-4" />
                Organization Hierarchy
              </h3>
              
              <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                <button
                  onClick={() => setTreeViewMode('people')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${treeViewMode === 'people' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  People View
                </button>
                <button
                  onClick={() => setTreeViewMode('department')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${treeViewMode === 'department' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Department View
                </button>
              </div>

              <button
                onClick={() => fetchOrgData()}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                <Loader2 className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            <div className="org-tree-container w-full overflow-x-auto no-scrollbar py-6">
              <div className="org-tree">
                <ul>
                  {treeData.map((node) => (
                    <OrgChartNode
                      key={node.id}
                      node={node}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAddChild={addChildTo}
                      employees={employees}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Departments Table */}
        {activeTab === 'departments' && (
          <div className="card-elevated border border-border rounded-2xl bg-card overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <h3 className="font-semibold text-[15px] text-card-foreground">All Departments</h3>
              <button
                onClick={() => openModal('create', null, { type: 'department' })}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground h-8 px-3 rounded-lg text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Department
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Teams</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {departments.map((dept) => {
                    const deptTeams = teams.filter(t => String(t.departmentId) === String(dept.id));
                    const teamCount = deptTeams.length;
                    const deptTeamIds = deptTeams.map(t => String(t.id));
                    const activeEmployees = employees.filter(e => deptTeamIds.includes(String(e.teamId))).length;
                    
                    return (
                    <tr key={dept.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                            <Component className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground">{dept.name}</div>
                            {dept.description && <div className="text-xs text-muted-foreground">{dept.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{dept.location || '—'}</td>
                      <td className="px-4 py-3 text-foreground">{teamCount}</td>
                      <td className="px-4 py-3 text-foreground">{activeEmployees}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(dept)} className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-500/10">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(dept)} className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                  {departments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                        No departments yet. Create your first department to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Teams Table */}
        {activeTab === 'teams' && (
          <div className="card-elevated border border-border rounded-2xl bg-card overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <h3 className="font-semibold text-[15px] text-card-foreground">All Teams</h3>
              <button
                onClick={() => openModal('create', null, { type: 'team', departmentId: departments[0]?.id || '' })}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground h-8 px-3 rounded-lg text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Team
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Members</th>
                    <th className="px-4 py-3">Lead</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teams.map((team) => {
                    const teamMembersCount = employees.filter(e => String(e.teamId) === String(team.id)).length;
                    const deptName = departments.find(d => String(d.id) === String(team.departmentId))?.name || team.department?.name || '—';
                    
                    return (
                    <tr key={team.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                            <Network className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground">{team.name}</div>
                            {team.description && <div className="text-xs text-muted-foreground">{team.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{deptName}</td>
                      <td className="px-4 py-3 text-foreground">{teamMembersCount}</td>
                      <td className="px-4 py-3 text-foreground">{team.lead?.name || '—'}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(team)} className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-500/10">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(team)} className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                  {teams.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                        No teams yet. Add a team to a department to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employees in Org */}
        {activeTab === 'employees' && (
          <div className="card-elevated border border-border rounded-2xl bg-card overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <h3 className="font-semibold text-[15px] text-card-foreground">All Employees</h3>
              <button
                onClick={() => openModal('create', null, { type: 'employee' })}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground h-8 px-3 rounded-lg text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Employee
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Reports To</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {employees.map((emp) => {
                    const team = teams.find((t) => String(t.id) === String(emp.teamId));
                    const manager = employees.find((e) => String(e.id) === String(emp.managerId));
                    return (
                      <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0">
                              {emp.avatar ? (
                                <img src={emp.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                  {emp.initials || emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{emp.name}</div>
                              <div className="text-xs text-muted-foreground">{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground">{emp.role || '—'}</td>
                        <td className="px-4 py-3">
                          {emp.level && (
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${levelColor(emp.level)}`}>
                              {emp.level}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{emp.department || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{team?.name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{manager?.name || '—'}</td>
                        <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(emp)} className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-500/10">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(emp)} className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">
                        No employees yet. Add your first team member.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
              <ModalContent />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
