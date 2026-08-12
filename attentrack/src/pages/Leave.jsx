import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  TrendingUp,
  Plus,
  X,
  Check,
  Ban,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useDataContext } from '../context/DataContext';
import { leaveService } from '../services/leaveService';
import { CustomSelect } from '../components/common/CustomSelect';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getEmployeeAvatar = (req, employees = []) => {
  const emp = employees.find(e => 
    String(e.id) === String(req.employeeId) || 
    (e.name && req.employeeName && e.name.toLowerCase() === req.employeeName.toLowerCase())
  );
  if (emp && emp.avatar) return emp.avatar;
  const fallbackName = req.employeeName || 'Employee';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random`;
};

export default function Leave() {
  const { user, isHRAdmin } = useAuth();
  const { leaves = [], employees = [], refreshAll } = useDataContext();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const location = useLocation();
  useEffect(() => {
    if (location.state?.autoOpenQuickAdd) {
      setIsApplyModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [formData, setFormData] = useState({
    type: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Dynamic filter tab counts
  const tabCounts = useMemo(() => {
    const all = leaves.length;
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    const myReqs = leaves.filter(l => String(l.employeeId) === String(user?.id) || l.employeeName === user?.name).length;

    return {
      All: all,
      Pending: pending,
      Approved: approved,
      Rejected: rejected,
      'My Requests': myReqs
    };
  }, [leaves, user]);

  // Dynamic stats
  const stats = useMemo(() => {
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;

    return [
      {
        title: 'Approved Requests',
        value: String(approved),
        change: approved > 0 ? `+${approved}` : null,
        isPositive: true,
        label: 'Approved this month',
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />
      },
      {
        title: 'Pending Approval',
        value: String(pending),
        change: null,
        label: 'Awaiting supervisor review',
        icon: <Clock className="h-5 w-5 text-amber-500" />
      },
      {
        title: 'Rejected Requests',
        value: String(rejected),
        change: null,
        label: 'Total this year',
        icon: <XCircle className="h-5 w-5 text-rose-500" />
      },
      {
        title: 'Public Holidays',
        value: '11',
        change: null,
        label: 'Remaining in 2026',
        icon: <Calendar className="h-5 w-5 text-blue-500" />
      }
    ];
  }, [leaves]);

  // Leave balances calculation
  const myBalance = useMemo(() => {
    const targetLeaves = leaves.filter(l => l.status === 'Approved');

    const getDaysForType = (typeName) => {
      return targetLeaves
        .filter(l => (l.type || '').toLowerCase().includes(typeName.toLowerCase()))
        .reduce((sum, l) => sum + (Number(l.days) || 1), 0);
    };

    return [
      { type: 'Casual Leave', used: getDaysForType('casual'), total: 12, color: 'bg-blue-500' },
      { type: 'Sick Leave', used: getDaysForType('sick'), total: 10, color: 'bg-emerald-500' },
      { type: 'Earned / Annual', used: getDaysForType('annual'), total: 20, color: 'bg-indigo-500' },
      { type: 'Work From Home', used: getDaysForType('work from home') || getDaysForType('wfh'), total: 24, color: 'bg-amber-500' }
    ];
  }, [leaves]);

  // Category Distribution for Pie Chart
  const leaveDistribution = useMemo(() => {
    const counts = { Casual: 0, Sick: 0, Annual: 0, WFH: 0, 'Comp Off': 0 };

    leaves.forEach(l => {
      const t = (l.type || '').toLowerCase();
      const days = Number(l.days) || 1;
      if (t.includes('casual')) counts.Casual += days;
      else if (t.includes('sick')) counts.Sick += days;
      else if (t.includes('annual') || t.includes('earned')) counts.Annual += days;
      else if (t.includes('wfh') || t.includes('work from home')) counts.WFH += days;
      else if (t.includes('comp')) counts['Comp Off'] += days;
      else counts.Casual += days;
    });

    return [
      { name: 'Casual', value: counts.Casual, color: '#3b82f6' },
      { name: 'Sick', value: counts.Sick, color: '#10b981' },
      { name: 'Annual', value: counts.Annual, color: '#6366f1' },
      { name: 'WFH', value: counts.WFH, color: '#f59e0b' },
      { name: 'Comp Off', value: counts['Comp Off'], color: '#a855f7' }
    ];
  }, [leaves]);

  // Monthly Leave Trends for Bar Chart
  const leaveByMonth = useMemo(() => {
    const monthlyData = MONTH_NAMES.map(month => ({ month, value: 0 }));

    leaves.forEach(l => {
      if (l.startDate) {
        const d = new Date(l.startDate);
        if (!isNaN(d.getTime())) {
          const monthIdx = d.getMonth();
          monthlyData[monthIdx].value += Number(l.days) || 1;
        }
      }
    });

    return monthlyData;
  }, [leaves]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return leaves.filter(req => {
      if (statusFilter === 'Pending') return req.status === 'Pending';
      if (statusFilter === 'Approved') return req.status === 'Approved';
      if (statusFilter === 'Rejected') return req.status === 'Rejected';
      if (statusFilter === 'My Requests') {
        return String(req.employeeId) === String(user?.id) || req.employeeName === user?.name;
      }
      return true;
    });
  }, [leaves, statusFilter, user]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

      const payload = {
        employeeId: user?.id || Date.now(),
        employeeName: user?.name || 'Staff Member',
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: diffDays > 0 ? diffDays : 1,
        reason: formData.reason,
        status: 'Pending'
      };

      await leaveService.submit(payload);
      await refreshAll();
      setIsApplyModalOpen(false);
      setSuccessMsg('Leave request submitted successfully for approval!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setFormData({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });
    } catch (err) {
      alert('Failed to submit leave request: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await leaveService.updateStatus(id, status);
      await refreshAll();
    } catch (err) {
      alert('Failed updating leave status: ' + (err.message || 'Server error'));
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await leaveService.delete(id);
      await refreshAll();
      setSuccessMsg('Leave request canceled.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed canceling leave request: ' + (err.message || 'Server error'));
    }
  };

  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">

        {/* Banner Notification */}
        {successMsg && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Time Off</div>
            <h1 className="truncate text-3xl font-bold tracking-tight text-foreground">Leave Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isHRAdmin 
                ? 'Review employee applications, approve pending time-off requests, and track company holiday balances.' 
                : 'View your leave balances, track application status, and submit time-off requests.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-5 rounded-full text-sm font-semibold transition-all shadow-md shadow-primary/20 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Apply Leave
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="card-elevated hover-lift p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-2 truncate text-foreground">{stat.value}</h3>
                </div>
                <div className={`p-2.5 rounded-2xl ${
                  stat.title.includes('Approved') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                  stat.title.includes('Pending') ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                  stat.title.includes('Rejected') ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
                  'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                {stat.change && (
                  <div className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg px-2 py-0.5 text-xs">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </div>
                )}
                <span className="text-muted-foreground text-xs">{stat.label || 'This month'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Leave Balances Grid */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-foreground">Leave Balances & Entitlements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {myBalance.map((item, i) => {
              const remaining = Math.max(0, item.total - item.used);
              const percentage = Math.min(100, Math.round((item.used / item.total) * 100));
              return (
                <div key={i} className="card-elevated p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{item.type}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {remaining} left
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-foreground">{item.used} <span className="text-xs font-normal text-muted-foreground">/ {item.total} days used</span></span>
                      <span className="text-xs font-semibold text-muted-foreground">{percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full mt-2 overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-1 text-foreground">Leave Category Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">Breakdown across all leave types</p>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leaveDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {leaveDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border, #e2e8f0)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Pie Chart Legend */}
            <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
              {leaveDistribution.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-muted-foreground truncate">{cat.name}:</span>
                  <span className="font-semibold text-foreground">{cat.value}d</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated p-6 lg:col-span-2 flex flex-col">
            <h3 className="text-base font-semibold mb-1 text-foreground">Monthly Leave Trends</h3>
            <p className="text-xs text-muted-foreground mb-6">Total leave days taken by month</p>
            <div className="h-[220px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border, #e2e8f0)' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Requests Table Card */}
        <div className="card-elevated overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-border gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Leave Applications</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Review and manage employee time-off applications</p>
            </div>

            {/* SEAMLESS THEME-ADAPTIVE FILTER TABS */}
            <div className="flex items-center gap-1 p-1 bg-muted/80 rounded-xl border border-border/50 overflow-x-auto">
              {[
                { id: 'All', label: 'All' },
                { id: 'Pending', label: 'Pending' },
                { id: 'Approved', label: 'Approved' },
                { id: 'Rejected', label: 'Rejected' },
                { id: 'My Requests', label: 'My Requests' }
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                const count = tabCounts[tab.id] || 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-card text-foreground font-semibold shadow-sm border border-border/40'
                        : 'text-muted-foreground hover:text-foreground font-medium hover:bg-card/40'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'bg-background/80 text-muted-foreground border border-border/40'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 divide-y divide-border/30">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                <AlertCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                No leave requests found matching filter "<span className="font-medium text-foreground">{statusFilter}</span>".
              </div>
            ) : (
              filteredRequests.map((req) => {
                const avatarUrl = getEmployeeAvatar(req, employees);
                const datesDisplay = `${formatDateDisplay(req.startDate)} → ${formatDateDisplay(req.endDate)}`;
                const durationDisplay = `${req.days || 1} day${(req.days || 1) > 1 ? 's' : ''}`;

                return (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/40 rounded-2xl transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <img src={avatarUrl} alt={req.employeeName} className="w-11 h-11 rounded-full border border-border bg-card object-cover flex-shrink-0 shadow-sm" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{req.employeeName || 'Staff Member'}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{req.type} · <span className="text-primary font-semibold">{durationDisplay}</span></p>
                        {req.reason && <p className="text-xs text-muted-foreground/80 italic mt-0.5 line-clamp-1">"{req.reason}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 ml-15 sm:ml-0 flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-xl border border-border/30">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{datesDisplay}</span>
                      </div>

                      {/* STYLISH STATUS BADGES */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${
                        req.status === 'Approved'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : req.status === 'Rejected'
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {req.status === 'Approved' && <CheckCircle className="w-3.5 h-3.5" />}
                        {req.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                        {req.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                        {req.status}
                      </span>

                      {/* HR Admin Approve / Reject */}
                      {isHRAdmin && req.status === 'Pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Approved')}
                            className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all shadow-sm cursor-pointer"
                            title="Approve Request"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                            className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all shadow-sm cursor-pointer"
                            title="Reject Request"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Allow owner or admin to cancel pending leave */}
                      {req.status === 'Pending' && (
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          className="p-2 bg-muted text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-border/60 rounded-xl transition-all shadow-sm cursor-pointer"
                          title="Cancel Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PERFECTLY THEME-MATCHED APPLY LEAVE MODAL */}
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-foreground mb-1">Apply for Leave</h2>
              <p className="text-xs text-muted-foreground mb-6">Submit your time-off request for supervisor review.</p>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <CustomSelect
                    label="Leave Type"
                    options={[
                      { label: 'Annual Leave', value: 'Annual Leave' },
                      { label: 'Casual Leave', value: 'Casual Leave' },
                      { label: 'Sick Leave', value: 'Sick Leave' },
                      { label: 'Work From Home (WFH)', value: 'Work From Home' },
                      { label: 'Comp Off', value: 'Comp Off' }
                    ]}
                    value={formData.type}
                    onChange={(val) => setFormData({ ...formData, type: val })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-xs md:text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-xs md:text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all h-[38px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Reason</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Provide brief reason for time off..."
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none placeholder:text-muted-foreground/60 transition-all"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 border border-border text-foreground hover:bg-muted font-medium rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm shadow-md shadow-primary/20 transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
