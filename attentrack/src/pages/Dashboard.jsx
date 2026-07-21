import React, { useState } from 'react';
import {
  ArrowUpRight, Sparkles, TrendingUp, TrendingDown,
  Users, UserCheck, Clock3, UserX, Wifi, PlaneTakeoff,
  MoreHorizontal, Cake, PartyPopper, Wallet, ListChecks,
  Heart, AlertTriangle, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- DATA ---
const attendanceData = Array.from({ length: 30 }, (_, i) => ({
  name: `${i + 1}`,
  present: 190 + Math.random() * 20 + Math.sin(i / 3) * 15,
  remote: 20 + Math.random() * 10,
  absent: 5 + Math.random() * 5
}));

const leaveData = [
  { name: 'Casual', value: 45, color: '#3b82f6' }, // blue
  { name: 'Sick', value: 25, color: '#06b6d4' }, // cyan
  { name: 'Earned', value: 20, color: '#22c55e' }, // green
  { name: 'WFH', value: 25, color: '#f59e0b' }, // yellow
  { name: 'Comp Off', value: 10, color: '#a855f7' } // purple
];

const departmentData = [
  { name: 'Engineering', value: 82 },
  { name: 'Product', value: 89 },
  { name: 'Design', value: 68 },
  { name: 'Marketing', value: 75 },
  { name: 'Sales', value: 80 },
  { name: 'Customer Success', value: 92 },
  { name: 'Finance', value: 72 },
  { name: 'People Ops', value: 78 },
  { name: 'Legal', value: 85 },
  { name: 'IT Ops', value: 94 },
  { name: 'Data & Analytics', value: 71 },
  { name: 'Operations', value: 76 }
];

const payrollData = [
  { name: 'Jan', value: 3.4 }, { name: 'Feb', value: 3.5 }, { name: 'Mar', value: 3.5 },
  { name: 'Apr', value: 3.6 }, { name: 'May', value: 3.7 }, { name: 'Jun', value: 3.7 },
  { name: 'Jul', value: 3.8 }, { name: 'Aug', value: 3.9 }, { name: 'Sep', value: 3.9 },
  { name: 'Oct', value: 4.0 }, { name: 'Nov', value: 4.1 }, { name: 'Dec', value: 4.3 }
];

const growthData = [
  { name: 'Jan', value: 195 }, { name: 'Feb', value: 205 }, { name: 'Mar', value: 215 },
  { name: 'Apr', value: 225 }, { name: 'May', value: 232 }, { name: 'Jun', value: 238 },
  { name: 'Jul', value: 242 }, { name: 'Aug', value: 246 }, { name: 'Sep', value: 248 },
  { name: 'Oct', value: 250 }, { name: 'Nov', value: 255 }, { name: 'Dec', value: 260 }
];

const radarData = [
  { subject: 'Goals', A: 95, fullMark: 100 },
  { subject: 'Discipline', A: 85, fullMark: 100 },
  { subject: 'Learning', A: 75, fullMark: 100 },
  { subject: 'Leadership', A: 80, fullMark: 100 },
  { subject: 'Communication', A: 90, fullMark: 100 },
  { subject: 'Innovation', A: 70, fullMark: 100 },
];

const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const heatmapHours = Array.from({ length: 12 }, (_, i) => i); // 12 columns for simplicity

// --- COMPONENTS ---
export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('Today');

  // Dynamic greeting and date
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const userName = 'Ellen'; // Could be fetched from auth context

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">

        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Executive Command Center</div>
            <h1 className="truncate text-2xl md:text-3xl font-semibold tracking-tight">{greeting}, {userName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Here's what's happening at Northwind Labs today — {formattedDate}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-muted p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-hide">
              {['Today', 'Week', 'Month', 'Quarter'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${timeRange === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground cursor-pointer'}`}>
                  {t}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors">
              <ArrowUpRight className="h-4 w-4" /> Share report
            </button>
          </div>
        </div>

        {/* Health Score & Live Activity */}
        <div className="card-elevated overflow-hidden border border-border/50 bg-card">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-0">
            <div className="p-6 relative">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Sparkles className="h-4 w-4" /> Organization Health Score
              </div>
              <div className="mt-4 flex items-end gap-3">
                <div className="text-6xl font-bold tracking-tight">86</div>
                <div className="pb-2">
                  <div className="text-sm font-medium text-success">+3.2 this month</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Top decile in your industry</div>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { label: 'Engagement', val: 92, offset: '-8%' },
                  { label: 'Retention', val: 88, offset: '-12%' },
                  { label: 'Productivity', val: 79, offset: '-21%' }
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 shadow-sm hover-lift">
                    <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
                    <div className="mt-1 text-xl font-semibold">{s.val}</div>
                    <div className="relative w-full overflow-hidden rounded-full bg-primary/10 mt-3 h-1.5">
                      <div className="h-full w-full flex-1 bg-primary rounded-full" style={{ transform: `translateX(${s.offset})` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-l border-border/50 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live activity</div>
                <div className="inline-flex items-center rounded-md border px-2 py-0.5 font-semibold bg-secondary/50 text-secondary-foreground gap-1.5 text-[10px]">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> Live
                </div>
              </div>
              <div className="space-y-4 max-h-[220px] overflow-y-auto scrollbar-thin pr-2">
                {[
                  { inits: 'PP', name: 'Priya Patel', action: 'checked in', meta: 'San Francisco · just now' },
                  { inits: 'MR', name: 'Marcus Reilly', action: 'moved to Onsite stage', meta: 'JR-202 · 4 min ago' },
                  { inits: 'AN', name: 'Ananya Nair', action: 'approved 3 leave requests', meta: 'Design · 12 min ago' },
                  { inits: 'RI', name: 'Rohan Iyer', action: 'generated July payroll', meta: 'Finance · 38 min ago' },
                  { inits: 'IK', name: 'Isha Kapoor', action: 'closed hiring for JR-203', meta: 'Sales · 1h ago' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm group cursor-pointer">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border group-hover:border-primary/30 transition-colors text-xs font-medium">
                      {act.inits}
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="truncate"><span className="font-semibold">{act.name}</span> <span className="text-muted-foreground">{act.action}</span></div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{act.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 12 Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {[
            { title: 'Total employees', val: '250', icon: Users, color: 'text-primary', bg: 'bg-primary/10', trendIcon: TrendingUp, trendVal: '+2.4%', trendColor: 'text-success bg-success/10' },
            { title: 'Present today', val: '197', icon: UserCheck, color: 'text-success', bg: 'bg-success/10', trendIcon: TrendingUp, trendVal: '+1.1%', trendColor: 'text-success bg-success/10' },
            { title: 'Late arrivals', val: '14', icon: Clock3, color: 'text-warning', bg: 'bg-warning/10', trendIcon: TrendingDown, trendVal: '-8.2%', trendColor: 'text-destructive bg-destructive/10' },
            { title: 'Absent', val: '10', icon: UserX, color: 'text-destructive', bg: 'bg-destructive/10', trendIcon: TrendingDown, trendVal: '-2.6%', trendColor: 'text-destructive bg-destructive/10' },
            { title: 'Remote', val: '28', icon: Wifi, color: 'text-info', bg: 'bg-info/10', trendIcon: TrendingUp, trendVal: '+4.7%', trendColor: 'text-success bg-success/10' },
            { title: 'On leave', val: '15', icon: PlaneTakeoff, color: 'text-info', bg: 'bg-info/10', trendIcon: TrendingUp, trendVal: '+0.6%', trendColor: 'text-success bg-success/10' },
            { title: 'Birthdays', val: '3', icon: Cake, color: 'text-primary', bg: 'bg-primary/10', label: 'Today' },
            { title: 'Anniversaries', val: '7', icon: PartyPopper, color: 'text-primary', bg: 'bg-primary/10', label: 'This week' },
            { title: 'Monthly payroll', val: '$2,707,833', icon: Wallet, color: 'text-success', bg: 'bg-success/10', trendIcon: TrendingUp, trendVal: '+3.1%', trendColor: 'text-success bg-success/10' },
            { title: 'Pending tasks', val: '12', icon: ListChecks, color: 'text-warning', bg: 'bg-warning/10' },
            { title: 'Satisfaction', val: '8.6/10', icon: Heart, color: 'text-success', bg: 'bg-success/10', trendIcon: TrendingUp, trendVal: '+1.8%', trendColor: 'text-success bg-success/10' },
            { title: 'Attrition risk', val: '4.2%', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', trendIcon: TrendingDown, trendVal: '-0.4%', trendColor: 'text-destructive bg-destructive/10' },
          ].map((stat, i) => (
            <div key={i} className="card-elevated hover-lift p-5 bg-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted-foreground truncate">{stat.title}</div>
                  <div className="mt-1.5 text-2xl font-bold tracking-tight truncate">{stat.val}</div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${stat.color} ${stat.bg}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium">
                {stat.trendVal ? (
                  <>
                    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 ${stat.trendColor}`}>
                      <stat.trendIcon className="h-3 w-3" />
                      {stat.trendVal}
                    </span>
                    <span className="text-muted-foreground">vs last month</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{stat.label}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Attendance & Leave Analysis */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Attendance Area Chart */}
          <div className="lg:col-span-2 card-elevated p-6 bg-card flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-base">Attendance trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Present, remote and absent over the last 30 days</p>
              </div>
              <div className="text-xs font-medium bg-muted px-2.5 py-1 rounded-md text-muted-foreground">Last 30 days</div>
            </div>
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRemote" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={15} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600, padding: '2px 0' }}
                    labelStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="present" name="present" stroke="#3b82f6" strokeWidth={2} fill="url(#colorPresent)" />
                  <Area type="monotone" dataKey="remote" name="remote" stroke="#06b6d4" strokeWidth={2} fill="url(#colorRemote)" />
                  <Area type="monotone" dataKey="absent" name="absent" stroke="#f59e0b" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Analysis Pie */}
          <div className="card-elevated p-6 bg-card flex flex-col relative overflow-hidden">
            <div>
              <h3 className="font-semibold text-base">Leave analysis</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Distribution by type · this quarter</p>
            </div>
            <div className="flex-1 min-h-[200px] mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leaveData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                    {leaveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {leaveData.map(l => (
                <div key={l.name} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }}></div>
                  {l.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Charts Row */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Department Performance Bar */}
          <div className="card-elevated p-6 bg-card flex flex-col">
            <h3 className="font-semibold text-base">Department performance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">360° score by department</p>
            <div className="h-[220px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 0, right: 0, left: -25, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} angle={-35} textAnchor="end" dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payroll Line */}
          <div className="card-elevated p-6 bg-card flex flex-col">
            <h3 className="font-semibold text-base">Payroll cost</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Total cost & bonus, in $M</p>
            <div className="h-[220px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 8]} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))' }} activeDot={{ r: 6, fill: '#3b82f6' }} />
                  {/* Fake orange line for bonus */}
                  <Line type="monotone" dataKey={() => 0.5} stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hiring Funnel */}
          <div className="card-elevated p-6 bg-card flex flex-col">
            <h3 className="font-semibold text-base">Hiring funnel</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Q3 · 6 open roles</p>
            <div className="mt-6 space-y-4 flex-1 flex flex-col justify-between pb-2">
              {[
                { label: 'Applied', val: '1,240', pct: '100%', color: 'bg-primary' },
                { label: 'Screened', val: '486', pct: '40%', color: 'bg-[#06b6d4]' },
                { label: 'Interview', val: '182', pct: '15%', color: 'bg-[#22c55e]' },
                { label: 'Offer', val: '48', pct: '4%', color: 'bg-[#f59e0b]' },
                { label: 'Hired', val: '31', pct: '2.5%', color: 'bg-[#a855f7]' }
              ].map(f => (
                <div key={f.label}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span>{f.label}</span>
                    <span className="text-muted-foreground">{f.val}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${f.color} rounded-full`} style={{ width: f.pct }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Charts Row - Bottom */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Employee Growth */}
          <div className="card-elevated p-6 bg-card flex flex-col">
            <h3 className="font-semibold text-base">Employee growth</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Headcount, joiners and leavers</p>
            <div className="h-[220px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={15} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 260]} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} fill="url(#colorGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Heatmap */}
          <div className="card-elevated p-6 bg-card flex flex-col">
            <h3 className="font-semibold text-base">Working hours heatmap</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Activity across the week</p>
            <div className="mt-6 flex-1 flex flex-col">
              <div className="flex flex-1">
                <div className="flex flex-col justify-between text-[10px] text-muted-foreground pr-2 font-medium">
                  {heatmapDays.map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="flex-1 grid grid-rows-7 gap-1">
                  {heatmapDays.map((d, rIdx) => (
                    <div key={d} className="grid grid-cols-12 gap-1 h-full">
                      {heatmapHours.map((h, cIdx) => {
                        // random intensity for visual
                        const intensity = [0.1, 0.2, 0.4, 0.6, 0.8, 1][Math.floor(Math.random() * ((rIdx > 4) ? 3 : 6))];
                        return (
                          <div key={cIdx} className="bg-primary rounded-[2px]" style={{ opacity: intensity }}></div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium mt-2 pl-6">
                <span>8 AM</span>
                <span>Peak</span>
                <span>8 PM</span>
              </div>
            </div>
          </div>

          {/* Productivity Radar */}
          <div className="card-elevated p-6 bg-card flex flex-col relative overflow-hidden">
            <h3 className="font-semibold text-base">Productivity radar</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Weighted 360° model</p>
            <div className="flex-1 min-h-[220px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Action Widgets Row */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Approvals Pending */}
          <div className="card-elevated p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">Approvals pending</h3>
              <a href="#" className="text-xs font-medium text-foreground hover:underline flex items-center gap-0.5">View all <ChevronRight className="h-3 w-3" /></a>
            </div>
            <p className="text-xs text-muted-foreground -mt-3 mb-5">Requires your attention</p>
            <div className="space-y-3">
              {[
                { type: 'Leave', name: 'Priya Patel', desc: '3 days casual leave...' },
                { type: 'Expense', name: 'Rohan Iyer', desc: '$482 · Client din...' },
                { type: 'WFH', name: 'Meera Gupta', desc: 'Aug 05 · doctor app...' },
                { type: 'Reimbursement', name: 'Kabir R...', desc: '$126 · Ho...' },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] font-semibold bg-muted px-2 py-1 rounded-md text-muted-foreground w-fit min-w-[3.5rem] text-center shrink-0">{a.type}</div>
                    <div>
                      <div className="text-sm font-semibold leading-tight">{a.name}</div>
                      <div className="text-[11px] text-muted-foreground">{a.desc}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md border border-transparent hover:border-border hover:bg-muted transition-colors">Deny</button>
                    <button className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="card-elevated p-6 bg-card flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-base">Top performers</h3>
              <Cake className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-5">Highest 360° scores this quarter</p>
            <div className="space-y-4 flex-1">
              {[
                { name: 'Ravi Iyer', role: 'Controller · Finance', score: 100 },
                { name: 'Hiro Menon', role: 'Operations Analyst · Operations', score: 100 },
                { name: 'Meera Taylor', role: 'Finance Manager · Finance', score: 100 },
                { name: 'Santiago Jackson', role: 'SRE · IT Ops', score: 100 },
                { name: 'Camila Wang', role: 'Operations Manager · Operations', score: 100 },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 text-xs font-semibold text-muted-foreground text-center bg-muted/50 rounded-full h-5 flex items-center justify-center">{i + 1}</div>
                  <div className="h-8 w-8 rounded-full bg-muted border border-border shrink-0 flex items-center justify-center text-xs overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate leading-tight">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{p.role}</div>
                  </div>
                  <div className="text-sm font-bold text-success">{p.score}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-2">
              <div className="text-xs font-semibold">Today's birthdays</div>
              <div className="flex -space-x-2">
                {['a', 'b', 'c'].map(s => (
                  <div key={s} className="h-6 w-6 rounded-full border-2 border-card bg-muted overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${s}`} alt="avatar" />
                  </div>
                ))}
                <div className="h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-bold">+2</div>
              </div>
            </div>
          </div>

          {/* AI Copilot Insights */}
          <div className="card-elevated p-6 bg-card flex flex-col bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 font-semibold text-base">
                <div className="bg-primary text-primary-foreground p-1 rounded-md"><Sparkles className="h-3 w-3" /></div>
                AI Copilot insights
              </div>
              <div className="text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">4 new</div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Weekly signals detected</p>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {[
                { title: '5 employees at elevated attrition risk', desc: 'Model detected drop in engagement + declining PR reviews for 5 engineers on Platform team. Suggest 1:1s this week.' },
                { title: 'Sales team burnout signals', desc: 'Average working hours up 18% in Sales for 3 weeks. Consider redistributing Q3 quota or approving comp-off.' },
                { title: 'Hiring velocity up 22% QoQ', desc: 'Time-to-hire dropped from 32 to 25 days. Referrals converting at 3.4x industry average.' }
              ].map((ai, i) => (
                <div key={i} className="bg-background border border-border/50 rounded-xl p-3 shadow-sm hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="text-xs font-semibold leading-tight mb-1">{ai.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">{ai.desc}</div>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full bg-background border border-border hover:bg-muted font-medium text-sm py-2 rounded-xl transition-colors shadow-sm">
              Open AI Copilot
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}
