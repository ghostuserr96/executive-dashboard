import React, { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Award, Calendar, RefreshCw } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useDataContext } from '../context/DataContext';

const KPICard = ({ title, value, trend, isPositive, trendText, icon: Icon }) => (
  <div className="card-elevated p-5 flex flex-col justify-between hover-lift">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        <div className="text-3xl font-bold mt-2 font-mono">{value}</div>
      </div>
      <div className={`p-2.5 rounded-xl ${isPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
        {Icon ? <Icon className="w-5 h-5" /> : (isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />)}
      </div>
    </div>
    <div className="mt-4 flex items-center text-[11px] font-medium">
      <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 ${isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive ? '+' : ''}{trend}%
      </span>
      <span className="text-muted-foreground ml-2">{trendText}</span>
    </div>
  </div>
);

export default function Analytics() {
  const { employees, attendance, leaves, performance, tasks, refreshAll, loading } = useDataContext();
  const [timeFilter, setTimeFilter] = useState('Quarter');
  const [isExporting, setIsExporting] = useState(false);

  // Timeframe multiplier for dynamic metrics
  const filterMultiplier = timeFilter === 'Month' ? 1 : timeFilter === 'Quarter' ? 3 : 12;

  // 1. Live Headcount & Growth
  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter(e => e.status === 'Active')?.length || totalEmployees;
  const headcountGrowthPercent = useMemo(() => {
    return 'N/A'; // No historical headcount data in DB to calculate growth
  }, []);

  // 2. Real Department Breakdown & Performance Scorecards
  const departmentScorecards = useMemo(() => {
    const deptMap = {};
    (employees || []).forEach(emp => {
      const dept = emp.department || 'General';
      if (!deptMap[dept]) {
        deptMap[dept] = { count: 0, totalScore: 0, scoreCount: 0 };
      }
      deptMap[dept].count += 1;
    });

    (performance || []).forEach(perf => {
      const dept = perf.department || 'General';
      if (deptMap[dept]) {
        deptMap[dept].totalScore += (perf.overallScore || 85);
        deptMap[dept].scoreCount += 1;
      }
    });

    const result = Object.keys(deptMap).map(dept => {
      const info = deptMap[dept];
      const avgScore = info.scoreCount > 0 ? Math.round(info.totalScore / info.scoreCount) : 0;
      return {
        name: dept,
        score: avgScore,
        people: info.count
      };
    });

    return result;
  }, [employees, performance]);

  // 3. Real Average Performance / eNPS score
  const avgPerformanceScore = useMemo(() => {
    if (!performance || performance.length === 0) return 0;
    const sum = performance.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
    return Math.round(sum / performance.length);
  }, [performance]);

  // 4. Real Leave Distribution
  const leaveDistribution = useMemo(() => {
    const counts = { 'Annual': 0, 'Sick': 0, 'Casual': 0, 'WFH / Other': 0 };
    (leaves || []).forEach(l => {
      const t = l.type || '';
      if (t.includes('Annual')) counts['Annual'] += (l.days || 1);
      else if (t.includes('Sick')) counts['Sick'] += (l.days || 1);
      else if (t.includes('Casual')) counts['Casual'] += (l.days || 1);
      else counts['WFH / Other'] += (l.days || 1);
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const data = [
      { name: 'Annual Leave', value: counts['Annual'], color: colors[0] },
      { name: 'Sick Leave', value: counts['Sick'], color: colors[1] },
      { name: 'Casual Leave', value: counts['Casual'], color: colors[2] },
      { name: 'WFH / Other', value: counts['WFH / Other'], color: colors[3] }
    ].filter(item => item.value > 0);
    return data;
  }, [leaves]);

  const headcountChartData = useMemo(() => {
    if (employees.length === 0) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    return months.map((m, idx) => {
      if (idx > currentMonth) return { name: m, value: 0 };
      
      const count = employees.filter(emp => {
        if (!emp.joinDate) return true; 
        const d = new Date(emp.joinDate);
        return d.getFullYear() < currentYear || (d.getFullYear() === currentYear && d.getMonth() <= idx);
      }).length;
      
      return { name: m, value: count };
    });
  }, [employees]);

  const attendanceTrendData = useMemo(() => {
    if (attendance.length === 0) return [];
    
    const dataMap = {};
    const now = new Date();
    
    attendance.forEach(att => {
      if (!att.timestamp && !att.date) return;
      const d = new Date(att.timestamp || att.date);
      if (isNaN(d.getTime())) return;
      
      let key = '';
      if (timeFilter === 'Month') {
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          key = `Day ${d.getDate()}`;
        }
      } else if (timeFilter === 'Quarter') {
        const currentQ = Math.floor(now.getMonth() / 3);
        if (Math.floor(d.getMonth() / 3) === currentQ && d.getFullYear() === now.getFullYear()) {
          // Just use month names for quarter view
          key = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
        }
      } else { // Year
        if (d.getFullYear() === now.getFullYear()) {
          key = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
        }
      }
      
      if (key) {
        if (!dataMap[key]) dataMap[key] = { name: key, present: 0, absent: 0, late: 0 };
        if (att.status === 'Present' || att.status === 'On time' || att.status === 'On Time') dataMap[key].present++;
        else if (att.status === 'Absent') dataMap[key].absent++;
        else if (att.status === 'Late') dataMap[key].late++;
      }
    });
    
    return Object.values(dataMap).map(day => {
      const total = day.present + day.absent + day.late;
      const rate = total > 0 ? Math.round((day.present / total) * 100) : 100;
      return {
        ...day,
        attendanceRate: rate,
        targetRate: 95 // Hardcoded target rate for comparison
      };
    }).sort((a, b) => {
      // Basic sort by name just so days are somewhat ordered
      if (a.name.includes('Day') && b.name.includes('Day')) {
        return parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]);
      }
      return 0;
    });
  }, [timeFilter, attendance]);

  const payrollChartData = useMemo(() => {
    // Fake data removed. In a real app, calculate sum of salaries.
    return [];
  }, [totalEmployees, filterMultiplier]);

  // PDF Export Trigger
  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 300);
  };

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6 animate-fade-in print:p-0 print:bg-background">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:hidden">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 flex items-center gap-2">
              <span>Analytics Center</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-normal">Real-Time Data Engine Active</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Analytics</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Live organizational metrics, attendance forecasting, payroll analysis, and department performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refreshAll()}
              className="p-2 border border-border rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Timeframe selector */}
            <div className="flex bg-muted/50 rounded-full p-1 border border-border shadow-inner">
              {['Month', 'Quarter', 'Year'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    timeFilter === f
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* PDF Export Button */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20 rounded-full text-sm font-semibold transition-all shadow-md cursor-pointer"
            >
              <Download size={16} />
              {isExporting ? 'Generating...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {/* Printable Title (visible during print) */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-foreground">AttenTrack Executive Analytics Report</h1>
          <p className="text-xs text-slate-600">Generated on {new Date().toLocaleDateString()} | Filter: {timeFilter}</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPICard
            title="Total Headcount"
            value={String(totalEmployees)}
            trend={null}
            isPositive={true}
            trendText={null}
            icon={Users}
          />
          <KPICard
            title="Active Employees"
            value={String(activeEmployees)}
            trend={null}
            isPositive={true}
            trendText={null}
            icon={Users}
          />
          <KPICard
            title="Total Departments"
            value={String(departmentScorecards.length)}
            trend={null}
            isPositive={true}
            trendText={null}
            icon={DollarSign}
          />
          <KPICard
            title="Performance Score / eNPS"
            value={`${avgPerformanceScore}`}
            trend={null}
            isPositive={true}
            trendText={null}
            icon={Award}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

          {/* Headcount Forecast Chart */}
          <div className="card-elevated p-6 flex flex-col h-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base text-foreground">Headcount Forecast</h3>
              <span className="text-xs text-muted-foreground">Live Organization Projection</span>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={headcountChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                      backgroundColor: '#0f172a',
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHeadcount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Trend Chart */}
          <div className="card-elevated p-6 flex flex-col h-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base text-foreground">Attendance Trend (%)</h3>
              <span className="text-xs text-emerald-400 font-medium">Live Database Average</span>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} minTickGap={15} />
                  <YAxis domain={[70, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                      backgroundColor: '#0f172a',
                      color: '#fff'
                    }}
                  />
                  <Line type="monotone" dataKey="attendanceRate" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="targetRate" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payroll Cost Chart */}
          <div className="card-elevated p-6 flex flex-col h-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base text-foreground">Payroll Expenditures ($M)</h3>
              <span className="text-xs text-muted-foreground">Monthly Budget Trend</span>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                      backgroundColor: '#0f172a',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Distribution Pie Chart */}
          <div className="card-elevated p-6 flex flex-col h-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base text-foreground">Leave Category Distribution</h3>
              <span className="text-xs text-muted-foreground">{leaves?.length || 0} Total Requests</span>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius="48%"
                    outerRadius="78%"
                    dataKey="value"
                    stroke="transparent"
                    paddingAngle={4}
                  >
                    {leaveDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                      backgroundColor: '#0f172a',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs mt-2">
              {leaveDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Department Scorecards Grid */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-base text-foreground">Department Scorecards</h3>
              <p className="text-xs text-muted-foreground">Calculated headcount & performance index per department</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {departmentScorecards.length} Departments Tracked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {departmentScorecards.map((dept, idx) => (
              <div
                key={idx}
                className="border border-border/60 rounded-xl p-4 bg-card/60 shadow-sm hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
              >
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 truncate" title={dept.name}>
                  {dept.name}
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-foreground font-mono">{dept.score}</div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    Index
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between border-t border-border/40 pt-2">
                  <span>Headcount</span>
                  <span className="font-semibold text-foreground">{dept.people} employees</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
