import React from 'react';
import {
  Award,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Mock Data
const performanceStats = [
  {
    title: 'Avg. 360° score',
    value: '82.4',
    change: '+2.6%',
    isPositive: true,
    icon: <Award className="h-5 w-5 text-green-600 dark:text-green-500" />,
    bg: 'bg-green-50 dark:bg-green-500/10'
  },
  {
    title: 'Goal completion',
    value: '74%',
    change: '+4.1%',
    isPositive: true,
    icon: <Target className="h-5 w-5 text-blue-600 dark:text-blue-500" />,
    bg: 'bg-blue-50 dark:bg-blue-500/10'
  },
  {
    title: 'High potentials',
    value: '22',
    change: '+9.5%',
    isPositive: true,
    icon: <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500" />,
    bg: 'bg-green-50 dark:bg-green-500/10'
  },
  {
    title: 'Reviews due',
    value: '18',
    change: null,
    icon: <Users className="h-5 w-5 text-amber-600 dark:text-amber-500" />,
    bg: 'bg-amber-50 dark:bg-amber-500/10'
  }
];

const radarData = [
  { subject: 'Goals', A: 90, fullMark: 100 },
  { subject: 'Discipline', A: 75, fullMark: 100 },
  { subject: 'Learning', A: 85, fullMark: 100 },
  { subject: 'Leadership', A: 70, fullMark: 100 },
  { subject: 'Communication', A: 80, fullMark: 100 },
  { subject: 'Innovation', A: 65, fullMark: 100 },
];

const departmentPerformance = [
  { name: 'Engineering', value: 81 },
  { name: 'Product', value: 89 },
  { name: 'Design', value: 68 },
  { name: 'Marketing', value: 75 },
  { name: 'Sales', value: 83 },
  { name: 'Customer Success', value: 89 },
  { name: 'Finance', value: 68 },
  { name: 'People Ops', value: 76 },
  { name: 'Legal', value: 82 },
  { name: 'IT Ops', value: 89 },
  { name: 'Data & Analytics', value: 70 },
  { name: 'Operations', value: 77 }
];

const topPerformers = [
  { name: "Ravi Iyer", role: "Controller \u00b7 Finance", score: 100, change: "+3.2", avatar: "https://i.pravatar.cc/150?u=12" },
  { name: "Hiro Menon", role: "Operations Analyst \u00b7 Operations", score: 100, change: "+3.2", avatar: "https://i.pravatar.cc/150?u=13" },
  { name: "Meera Taylor", role: "Finance Manager \u00b7 Finance", score: 100, change: "+3.2", avatar: "https://i.pravatar.cc/150?u=14" },
  { name: "Santiago Jackson", role: "SRE \u00b7 IT Ops", score: 100, change: "+3.2", avatar: "https://i.pravatar.cc/150?u=15" },
  { name: "Camila Wang", role: "Operations Manager \u00b7 Operations", score: 100, change: "+3.2", avatar: "https://i.pravatar.cc/150?u=16" },
  { name: "Ravi Iyer", role: "Controller \u00b7 Finance", score: 100, change: "+3.2", avatar: "https://i.pravatar.cc/150?u=12" },
];

const needsCoaching = [
  { name: "Evelyn Tanaka", role: "IT Specialist \u00b7 IT Ops", score: 55, change: "-1.4", avatar: "https://i.pravatar.cc/150?u=21" },
  { name: "Priya Kapoor", role: "SDR \u00b7 Sales", score: 55, change: "-1.4", avatar: "https://i.pravatar.cc/150?u=22" },
  { name: "Mason Miller", role: "Paralegal \u00b7 Legal", score: 55, change: "-1.4", avatar: "https://i.pravatar.cc/150?u=23" },
  { name: "Priya Suzuki", role: "Paralegal \u00b7 Legal", score: 56, change: "-1.4", avatar: "https://i.pravatar.cc/150?u=24" },
];

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
  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">360\u00b0 Performance</div>
            <h1 className="truncate text-3xl font-semibold tracking-tight">Performance</h1>
            <p className="mt-1 text-sm text-muted-foreground">Multi-source ratings, goals, promotions and succession planning \u2014 powered by AI.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceStats.map((stat, i) => (
            <div key={i} className="card-elevated p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-semibold mt-2 truncate">{stat.value}</h3>
                </div>
                <div className={`p-2 rounded-full border border-border/50 ${stat.bg}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                {stat.change ? (
                  <>
                    <div className={`flex items-center gap-1 font-medium rounded px-1.5 py-0.5 ${
                      stat.isPositive ? 'text-green-700 bg-green-50 dark:bg-green-500/20 dark:text-green-400' : 'text-red-700 bg-red-50 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {stat.isPositive ? <TrendingUp className="h-3 w-3" /> : null}
                      {stat.change}
                    </div>
                    <span className="text-muted-foreground">vs last month</span>
                  </>
                ) : (
                  <span className="text-muted-foreground invisible">No change</span> // keep layout consistent
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Middle Section: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Company Radar */}
          <div className="card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-2">Company radar</h3>
            <div className="h-[250px] w-full flex-1 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Company" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Comparison (Bar Chart) */}
          <div className="lg:col-span-2 card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-6">Department comparison</h3>
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentPerformance} margin={{ top: 0, right: 0, left: -20, bottom: 40 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-border" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<CustomTick />} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} ticks={[0, 25, 50, 75, 100]} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }} 
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
              <h3 className="text-base font-semibold">Top performers</h3>
              <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 text-xs font-semibold">
                Promotion ready
              </span>
            </div>
            <div className="p-4 space-y-4">
              {topPerformers.map((user, i) => (
                <div key={i} className="flex gap-4 p-4 bg-background border border-border/50 rounded-xl shadow-sm">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium">{user.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{user.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{user.score}</div>
                        <div className="text-xs text-green-600 dark:text-green-500 font-medium mt-0.5">{user.change}</div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${user.score}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Coaching */}
          <div className="card-elevated">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-base font-semibold">Needs coaching</h3>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-xs font-semibold">
                Below target
              </span>
            </div>
            <div className="p-4 space-y-4">
              {needsCoaching.map((user, i) => (
                <div key={i} className="flex gap-4 p-4 bg-background border border-border/50 rounded-xl shadow-sm">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium">{user.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{user.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{user.score}</div>
                        <div className="text-xs text-red-600 dark:text-red-500 font-medium mt-0.5">{user.change}</div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${user.score}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
