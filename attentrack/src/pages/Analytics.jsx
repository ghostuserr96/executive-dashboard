import React, { useState } from 'react';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Rectangle
} from 'recharts';

// Data
const headcountData = [
  { name: 'Jan', value: 195 },
  { name: 'Feb', value: 205 },
  { name: 'Mar', value: 212 },
  { name: 'Apr', value: 220 },
  { name: 'May', value: 226 },
  { name: 'Jun', value: 232 },
  { name: 'Jul', value: 238 },
  { name: 'Aug', value: 242 },
  { name: 'Sep', value: 246 },
  { name: 'Oct', value: 250 },
  { name: 'Nov', value: 253 },
  { name: 'Dec', value: 255 },
];

const attendanceData = Array.from({ length: 30 }, (_, i) => ({
  name: `${i + 1}`,
  value: 200 + Math.sin(i / 3) * 20 + Math.random() * 5,
  baseline: 20 + Math.sin(i / 5) * 5
}));

const payrollData = [
  { name: 'Jan', value: 3.3 },
  { name: 'Feb', value: 3.4 },
  { name: 'Mar', value: 3.48 },
  { name: 'Apr', value: 3.5 },
  { name: 'May', value: 3.6 },
  { name: 'Jun', value: 3.6 },
  { name: 'Jul', value: 3.7 },
  { name: 'Aug', value: 3.8 },
  { name: 'Sep', value: 3.8 },
  { name: 'Oct', value: 3.9 },
  { name: 'Nov', value: 4.0 },
  { name: 'Dec', value: 4.2 },
];

const leaveData = [
  { name: 'Annual', value: 45, color: '#3b82f6' }, // Blue
  { name: 'Sick', value: 25, color: '#10b981' }, // Green
  { name: 'Maternity', value: 20, color: '#f59e0b' }, // Orange/Yellow
  { name: 'Other', value: 10, color: '#a855f7' }, // Purple
];

const scorecards = [
  { name: 'Engineering', score: 81, people: 19 },
  { name: 'Product', score: 88, people: 25 },
  { name: 'Design', score: 68, people: 21 },
  { name: 'Marketing', score: 75, people: 24 },
  { name: 'Sales', score: 82, people: 17 },
  { name: 'Customer Success', score: 89, people: 20 },
  { name: 'Finance', score: 69, people: 27 },
  { name: 'People Ops', score: 76, people: 18 },
  { name: 'Legal', score: 83, people: 14 },
  { name: 'IT Ops', score: 90, people: 20 },
  { name: 'Data & Analytics', score: 70, people: 17 },
  { name: 'Operations', score: 77, people: 28 },
];

const KPICard = ({ title, value, trend, isPositive, trendText }) => (
  <div className="card-elevated p-5 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-3xl font-bold mt-2">{value}</div>
      </div>
      <div className={`p-2 rounded-full ${isPositive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
        {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
      </div>
    </div>
    <div className="mt-4 flex items-center text-[11px] font-medium">
      <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 ${isPositive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive ? '+' : ''}{trend}%
      </span>
      <span className="text-muted-foreground ml-2">{trendText}</span>
    </div>
  </div>
);

export default function Analytics() {
  const [timeFilter, setTimeFilter] = useState('Quarter');

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Analytics Center</div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive analytics</h1>
            <p className="text-muted-foreground mt-1 text-sm">Every KPI, chart and forecast — updated in real time across your organization.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-muted/50 rounded-full p-1 border border-border">
              {['Month', 'Quarter', 'Year'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    timeFilter === f 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full text-sm font-medium hover:bg-muted/50 transition-colors shadow-sm">
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPICard title="Headcount growth" value="+26%" trend={3.4} isPositive={true} trendText="vs last month" />
          <KPICard title="Attrition YTD" value="4.2%" trend={-1.6} isPositive={false} trendText="vs last month" />
          <KPICard title="Payroll YoY" value="+8.4%" trend={2.1} isPositive={true} trendText="vs last month" />
          <KPICard title="eNPS" value="+42" trend={5.0} isPositive={true} trendText="vs last month" />
        </div>

        {/* Charts Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          
          {/* Headcount Forecast */}
          <div className="card-elevated p-6 flex flex-col h-[320px]">
            <h3 className="font-semibold text-base mb-6 text-foreground">Headcount forecast</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={headcountData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHeadcount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Trend */}
          <div className="card-elevated p-6 flex flex-col h-[320px]">
            <h3 className="font-semibold text-base mb-6 text-foreground">Attendance trend</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="baseline" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payroll Cost */}
          <div className="card-elevated p-6 flex flex-col h-[320px]">
            <h3 className="font-semibold text-base mb-6 text-foreground">Payroll cost ($M)</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} activeBar={{ fill: '#d1d5db' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Distribution */}
          <div className="card-elevated p-6 flex flex-col h-[320px]">
            <h3 className="font-semibold text-base mb-6 text-foreground">Leave distribution</h3>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="80%"
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={3}
                  >
                    {leaveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Department Scorecards */}
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-base mb-6 text-foreground">Department scorecards</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {scorecards.map((dept, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium text-foreground mb-2 truncate" title={dept.name}>{dept.name}</div>
                <div className="text-2xl font-bold mb-1">{dept.score}</div>
                <div className="text-xs text-muted-foreground">{dept.people} people</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
