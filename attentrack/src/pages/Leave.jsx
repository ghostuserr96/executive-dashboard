import React from 'react';
import {
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  TrendingUp,
  Plus
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

// Mock Data
const leaveStats = [
  {
    title: 'Approved this month',
    value: '62',
    change: '+4.1%',
    isPositive: true,
    icon: <CheckCircle className="h-5 w-5 text-green-500" />
  },
  {
    title: 'Pending',
    value: '4',
    change: null,
    icon: <Clock className="h-5 w-5 text-amber-500" />
  },
  {
    title: 'Rejected',
    value: '2',
    change: null,
    icon: <XCircle className="h-5 w-5 text-red-500" />
  },
  {
    title: 'Public holidays',
    value: '11',
    change: null,
    label: 'Remaining in 2026',
    icon: <Calendar className="h-5 w-5 text-blue-500" />
  }
];

const leaveDistribution = [
  { name: 'Casual', value: 128, color: '#3b82f6' },
  { name: 'Sick', value: 84, color: '#0ea5e9' },
  { name: 'Earned', value: 62, color: '#22c55e' },
  { name: 'WFH', value: 145, color: '#f59e0b' },
  { name: 'Comp Off', value: 38, color: '#a855f7' }
];

const myBalance = [
  { type: 'Casual leave', used: 4, total: 12 },
  { type: 'Sick leave', used: 2, total: 10 },
  { type: 'Earned leave', used: 6, total: 20 },
  { type: 'Work from home', used: 8, total: 24 }
];

const leaveByMonth = [
  { month: 'Jan', value: 30 },
  { month: 'Feb', value: 44 },
  { month: 'Mar', value: 38 },
  { month: 'Apr', value: 52 },
  { month: 'May', value: 46 },
  { month: 'Jun', value: 61 },
  { month: 'Jul', value: 55 },
];

const leaveRequests = [
  { name: "Meera Park", role: "Legal", dates: "Jul 24 \u2192 Jul 26", duration: "3 days", type: "Casual", status: "Pending", avatar: "https://i.pravatar.cc/150?u=4" },
  { name: "Priya Wilson", role: "Product", dates: "Jul 18 \u2192 Jul 19", duration: "2 days", type: "Sick", status: "Approved", avatar: "https://i.pravatar.cc/150?u=8" },
  { name: "Isabella Taylor", role: "Customer Success", dates: "Aug 05 \u2192 Aug 05", duration: "1 day", type: "WFH", status: "Pending", avatar: "https://i.pravatar.cc/150?u=12" },
  { name: "Kenji Kapoor", role: "Sales", dates: "Aug 12 \u2192 Aug 18", duration: "7 days", type: "Earned", status: "Approved", avatar: "https://i.pravatar.cc/150?u=15" },
  { name: "Kenji Watanabe", role: "Legal", dates: "Jul 30 \u2192 Jul 30", duration: "1 day", type: "Comp Off", status: "Rejected", avatar: "https://i.pravatar.cc/150?u=18" },
  { name: "Liam Rahman", role: "Design", dates: "Jul 22 \u2192 Jul 22", duration: "1 day", type: "Casual", status: "Pending", avatar: "https://i.pravatar.cc/150?u=20" },
];

export default function Leave() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Time Off</div>
            <h1 className="truncate text-3xl font-semibold tracking-tight">Leave management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Balances, requests, holiday calendars and leave analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 h-10 px-5 rounded-full text-sm font-medium transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> Apply leave
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaveStats.map((stat, i) => (
            <div key={i} className="card-elevated hover-lift p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-semibold mt-2 truncate">{stat.value}</h3>
                </div>
                <div className={`p-2 rounded-full ${stat.title.includes('Approved') ? 'bg-green-100 dark:bg-green-500/20' : stat.title.includes('Pending') ? 'bg-amber-100 dark:bg-amber-500/20' : stat.title.includes('Rejected') ? 'bg-red-100 dark:bg-red-500/20' : 'bg-blue-100 dark:bg-blue-500/20'}`}>
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
                ) : stat.label ? (
                  <span className="text-muted-foreground">{stat.label}</span>
                ) : (
                  <span className="text-muted-foreground invisible">No change</span> // keep layout consistent
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Middle Section: Charts & Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Leave Distribution (Donut Chart) */}
          <div className="card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-2">Leave distribution</h3>
            <div className="h-[200px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveDistribution}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {leaveDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-medium mt-4">
              {leaveDistribution.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* My Balance (Progress Bars) */}
          <div className="card-elevated p-6 flex flex-col justify-between">
            <h3 className="text-base font-semibold mb-6">My balance</h3>
            <div className="space-y-6">
              {myBalance.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-foreground">{item.type}</span>
                    <span className="text-muted-foreground">{item.used} / {item.total}</span>
                  </div>
                  <div className="h-2.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${(item.used / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave by Month (Bar Chart) */}
          <div className="card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-6">Leave by month</h3>
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveByMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-border" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} minTickGap={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} ticks={[0, 15, 30, 45, 60]} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }} 
                  />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Requests Section */}
        <div className="card-elevated">
          <div className="p-6 border-b border-border">
            <h3 className="text-base font-semibold">Requests</h3>
          </div>
          
          <div className="p-2">
            {leaveRequests.map((req, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50 rounded-xl transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-full border border-border" />
                  <div>
                    <h4 className="text-sm font-medium">{req.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.role} · {req.dates} · {req.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 ml-14 sm:ml-0">
                  <div className="px-3 py-1 text-xs font-medium text-muted-foreground rounded-full bg-muted/50">
                    {req.type}
                  </div>
                  
                  {req.status === 'Pending' ? (
                    <>
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                        {req.status}
                      </span>
                      
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-full hover:bg-muted transition-colors">
                          Deny
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                          Approve
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-medium border ${
                      req.status === 'Approved' 
                        ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
                        : 'border-red-200 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                    }`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
