import React, { useState, useMemo } from 'react';
import {
  Award,
  Target,
  TrendingUp,
  Users,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Star,
  UserCheck,
  TrendingDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useDataContext } from '../context/DataContext';
import { performanceService } from '../services/performanceService';
import { CustomSelect } from '../components/common/CustomSelect';

const getEmployeePhoto = (empName, employeeId, employees = []) => {
  const matchedEmp = employees.find(e => 
    String(e.id) === String(employeeId) || 
    (e.name && empName && e.name.toLowerCase() === empName.toLowerCase())
  );

  if (matchedEmp && matchedEmp.avatar && !matchedEmp.avatar.includes('dicebear.com')) {
    return matchedEmp.avatar;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(empName || 'Employee')}&background=random`;
};

const CustomTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#6b7280" fontSize="10" transform="rotate(-35)">
        {payload.value}
      </text>
    </g>
  );
};

export default function Performance() {
  const { user, isHRAdmin } = useAuth();
  const { employees = [], performance: perfReviews = [], refreshAll } = useDataContext();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    overallScore: 88,
    goalCompletion: 85,
    discipline: 90,
    learning: 88,
    leadership: 85,
    communication: 90,
    innovation: 86,
    feedback: ''
  });

  // Calculate dynamic stats from DB performance records
  const stats = useMemo(() => {
    if (perfReviews.length === 0) {
      return [
        { title: 'Avg. 360° Score', value: 'N/A', change: null, isPositive: true, label: 'No reviews yet', icon: <Award className="h-5 w-5 text-emerald-500" /> },
        { title: 'Goal Completion', value: '0%', change: null, isPositive: true, label: 'No data', icon: <Target className="h-5 w-5 text-blue-500" /> },
        { title: 'High Potentials', value: '0', change: null, isPositive: true, label: 'Promotion ready candidates', icon: <TrendingUp className="h-5 w-5 text-indigo-500" /> },
        { title: 'Reviews Due', value: String(employees.length), change: null, label: 'Pending evaluation', icon: <Users className="h-5 w-5 text-amber-500" /> }
      ];
    }

    const totalAvg = (perfReviews.reduce((sum, r) => sum + Number(r.overallScore || 0), 0) / perfReviews.length).toFixed(1);
    const avgGoals = Math.round(perfReviews.reduce((sum, r) => sum + Number(r.goalCompletion || 80), 0) / perfReviews.length);
    const highPots = perfReviews.filter(r => Number(r.overallScore || 0) >= 88).length;
    const dueCount = Math.max(0, employees.length - perfReviews.length);

    return [
      {
        title: 'Avg. 360° Score',
        value: `${totalAvg}`,
        change: null, // Removed fake +2.4% history
        isPositive: true,
        label: 'Evaluated from database',
        icon: <Award className="h-5 w-5 text-emerald-500" />
      },
      {
        title: 'Goal Completion',
        value: `${avgGoals}%`,
        change: null, // Removed fake +3.8% history
        isPositive: true,
        label: 'Company wide average',
        icon: <Target className="h-5 w-5 text-blue-500" />
      },
      {
        title: 'High Potentials',
        value: String(highPots),
        change: null, // Removed fake +9.5% history
        isPositive: true,
        label: 'Promotion ready candidates',
        icon: <TrendingUp className="h-5 w-5 text-indigo-500" />
      },
      {
        title: 'Reviews Due',
        value: String(dueCount),
        change: null,
        label: 'Pending evaluation',
        icon: <Users className="h-5 w-5 text-amber-500" />
      }
    ];
  }, [perfReviews, employees]);

  // Company 360° Radar Chart Data
  const radarData = useMemo(() => {
    if (perfReviews.length === 0) {
      return [];
    }

    const calcAvg = (key, defaultVal) => Math.round(
      perfReviews.reduce((sum, r) => sum + Number(r[key] || defaultVal), 0) / perfReviews.length
    );

    return [
      { subject: 'Goals', A: calcAvg('goalCompletion', 0), fullMark: 100 },
      { subject: 'Discipline', A: calcAvg('discipline', 0), fullMark: 100 },
      { subject: 'Learning', A: calcAvg('learning', 0), fullMark: 100 },
      { subject: 'Leadership', A: calcAvg('leadership', 0), fullMark: 100 },
      { subject: 'Communication', A: calcAvg('communication', 0), fullMark: 100 },
      { subject: 'Innovation', A: calcAvg('innovation', 0), fullMark: 100 },
    ];
  }, [perfReviews]);

  // Department Performance Breakdown
  const departmentPerformance = useMemo(() => {
    const deptMap = {};

    employees.forEach(e => {
      const dept = e.department || 'Engineering';
      if (!deptMap[dept]) deptMap[dept] = { total: 0, count: 0 };
    });

    perfReviews.forEach(r => {
      const dept = r.department || 'Engineering';
      if (!deptMap[dept]) deptMap[dept] = { total: 0, count: 0 };
      deptMap[dept].total += Number(r.overallScore || 0);
      deptMap[dept].count += 1;
    });

    const results = Object.keys(deptMap).map(dept => {
      const avg = deptMap[dept].count > 0 
        ? Math.round(deptMap[dept].total / deptMap[dept].count)
        : 0;
      return { name: dept, value: avg };
    });

    if (results.length === 0) {
      return [];
    }

    return results;
  }, [perfReviews, employees]);

  // Top Performers List (Score >= 85)
  const topPerformers = useMemo(() => {
    const sorted = [...perfReviews].sort((a, b) => Number(b.overallScore || 0) - Number(a.overallScore || 0));
    return sorted.map(r => ({
      id: r.id,
      name: r.employeeName,
      role: `${r.role || 'Specialist'} · ${r.department || 'General'}`,
      score: r.overallScore || 0,
      change: null,
      avatar: getEmployeePhoto(r.employeeName, r.employeeId, employees)
    }));
  }, [perfReviews, employees]);

  // Needs Coaching List (Score < 85 or lower half)
  const needsCoaching = useMemo(() => {
    const lower = [...perfReviews].filter(r => Number(r.overallScore || 0) < 88);
    return lower.map(r => ({
      id: r.id,
      name: r.employeeName,
      role: `${r.role || 'Specialist'} · ${r.department || 'General'}`,
      score: r.overallScore || 0,
      change: null,
      avatar: getEmployeePhoto(r.employeeName, r.employeeId, employees)
    }));
  }, [perfReviews, employees]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      alert('Please select an employee to evaluate.');
      return;
    }

    setIsSubmitting(true);
    try {
      const emp = employees.find(e => String(e.id) === String(formData.employeeId));
      const payload = {
        employeeId: formData.employeeId,
        employeeName: emp ? emp.name : 'Employee',
        department: emp ? emp.department : 'Engineering',
        role: emp ? emp.role : 'Specialist',
        overallScore: Number(formData.overallScore),
        goalCompletion: Number(formData.goalCompletion),
        discipline: Number(formData.discipline),
        learning: Number(formData.learning),
        leadership: Number(formData.leadership),
        communication: Number(formData.communication),
        innovation: Number(formData.innovation),
        feedback: formData.feedback,
        reviewer: user?.name || 'HR Evaluator'
      };

      await performanceService.submitReview(payload);
      await refreshAll();
      setIsReviewModalOpen(false);
      setSuccessMsg(`Performance evaluation for ${payload.employeeName} submitted successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setFormData({
        employeeId: '',
        overallScore: 88,
        goalCompletion: 85,
        discipline: 90,
        learning: 88,
        leadership: 85,
        communication: 90,
        innovation: 86,
        feedback: ''
      });
    } catch (err) {
      alert('Failed submitting evaluation: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeOptions = employees.map(e => ({
    label: `${e.name} (${e.role || e.department || 'Employee'})`,
    value: String(e.id)
  }));

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
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">360° Performance</div>
            <h1 className="truncate text-3xl font-bold tracking-tight text-foreground">Performance Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Multi-source ratings, goal progress, and succession planning backed by database records.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-5 rounded-full text-sm font-semibold transition-all shadow-md shadow-primary/20 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Evaluate Employee
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
                  stat.title.includes('Avg') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                  stat.title.includes('Goal') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 
                  stat.title.includes('High') ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400'
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
                <span className="text-muted-foreground text-xs">{stat.label || 'Active metrics'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Section: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Company Radar */}
          <div className="card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-1 text-foreground">Company 360° Radar</h3>
            <p className="text-xs text-muted-foreground mb-4">Organizational skill competency average</p>
            <div className="h-[250px] w-full flex-1 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Company" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border, #e2e8f0)', backgroundColor: 'hsl(var(--card))' }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Comparison (Bar Chart) */}
          <div className="lg:col-span-2 card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-1 text-foreground">Department Performance Comparison</h3>
            <p className="text-xs text-muted-foreground mb-6">Average evaluation scores by team</p>
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentPerformance} margin={{ top: 0, right: 0, left: -20, bottom: 40 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-border" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<CustomTick />} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} ticks={[0, 25, 50, 75, 100]} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border, #e2e8f0)', backgroundColor: 'hsl(var(--card))' }} 
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Bottom Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Performers */}
          <div className="card-elevated">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-foreground">Top Performers</h3>
                <p className="text-xs text-muted-foreground mt-0.5">High achievers meeting promotion criteria</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                Promotion Ready
              </span>
            </div>
            <div className="p-4 space-y-3">
              {topPerformers.map((emp, i) => (
                <div key={emp.id || i} className="flex gap-4 p-4 bg-background border border-border/60 rounded-2xl hover:bg-muted/30 transition-colors shadow-sm items-center">
                  <img src={emp.avatar} alt={emp.name} className="w-11 h-11 rounded-full border border-border shrink-0 object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{emp.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{emp.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">{emp.score} / 100</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center justify-end gap-0.5">
                          <TrendingUp className="w-3 h-3" /> {emp.change}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${emp.score}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Coaching */}
          <div className="card-elevated">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-foreground">Coaching & Development</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Team members requiring additional support</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
                Development Focus
              </span>
            </div>
            <div className="p-4 space-y-3">
              {needsCoaching.map((emp, i) => (
                <div key={emp.id || i} className="flex gap-4 p-4 bg-background border border-border/60 rounded-2xl hover:bg-muted/30 transition-colors shadow-sm items-center">
                  <img src={emp.avatar} alt={emp.name} className="w-11 h-11 rounded-full border border-border shrink-0 object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{emp.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{emp.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">{emp.score} / 100</div>
                        <div className="text-xs text-rose-500 font-medium mt-0.5 flex items-center justify-end gap-0.5">
                          <TrendingDown className="w-3 h-3" /> {emp.change}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${emp.score}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* EVALUATE EMPLOYEE MODAL */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-foreground mb-1">Evaluate Employee</h2>
              <p className="text-xs text-muted-foreground mb-6">Submit 360° performance evaluation scores to the database.</p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <CustomSelect
                    label="Select Employee"
                    options={employeeOptions}
                    value={formData.employeeId}
                    onChange={(val) => setFormData({ ...formData, employeeId: val })}
                    placeholder="Choose an employee to review"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Overall Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={formData.overallScore}
                      onChange={(e) => setFormData({ ...formData, overallScore: e.target.value })}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Goal Completion %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={formData.goalCompletion}
                      onChange={(e) => setFormData({ ...formData, goalCompletion: e.target.value })}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none h-[38px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Leadership Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.leadership}
                      onChange={(e) => setFormData({ ...formData, leadership: e.target.value })}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Communication Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.communication}
                      onChange={(e) => setFormData({ ...formData, communication: e.target.value })}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none h-[38px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Evaluator Feedback</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                    placeholder="Provide constructive 360° feedback and goals..."
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none resize-none placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 border border-border text-foreground hover:bg-muted font-medium rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm shadow-md shadow-primary/20 transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Submitting...' : 'Save Review'}
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
