import React from 'react';
import {
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Download,
  Play
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar
} from 'recharts';

// Mock Data
const payrollStats = [
  {
    title: 'July payroll',
    value: '$2,707,833',
    change: '+3.1%',
    isPositive: true,
    icon: <Wallet className="h-5 w-5 text-green-500" />
  },
  {
    title: 'Bonuses',
    value: '$297,862',
    change: '+5.4%',
    isPositive: true,
    icon: <DollarSign className="h-5 w-5 text-blue-500" />
  },
  {
    title: 'Approvals',
    value: '12 pending',
    change: null,
    icon: <Clock className="h-5 w-5 text-amber-500" />
  },
  {
    title: 'Bank transfers',
    value: '94% cleared',
    change: '+0.8%',
    isPositive: true,
    icon: <CheckCircle className="h-5 w-5 text-green-500" />
  }
];

const progressSteps = [
  { title: 'Salary calculated', value: 100 },
  { title: 'Reviews', value: 82 },
  { title: 'Approvals', value: 64 },
  { title: 'Bank transfers', value: 94 }
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const payrollTrendData = months.map((m, i) => ({
  month: m,
  payroll: 3 + Math.sin(i / 5) * 1.5 + (i * 0.05),
  bonuses: 0.3 + Math.cos(i / 3) * 0.1 + (i * 0.02)
}));

const departmentCosts = [
  { name: 'Engineering', value: 310 },
  { name: 'Product', value: 230 },
  { name: 'Design', value: 245 },
  { name: 'Marketing', value: 260 },
  { name: 'Sales', value: 190 },
  { name: 'Customer Success', value: 320 },
  { name: 'Finance', value: 220 },
  { name: 'People Ops', value: 120 }
];

const payslipPreview = [
  { name: "Aiko Suzuki", id: "EMP-1000", role: "Legal", base: "$9,167", allowances: "+$1,100", deductions: "-$1,650", net: "$8,617", status: "Ready", avatar: "https://i.pravatar.cc/150?u=1" },
  { name: "Mateo Watanabe", id: "EMP-1001", role: "IT Ops", base: "$10,000", allowances: "+$1,200", deductions: "-$1,800", net: "$9,400", status: "Ready", avatar: "https://i.pravatar.cc/150?u=2" },
  { name: "Hiro White", id: "EMP-1002", role: "Design", base: "$14,750", allowances: "+$1,770", deductions: "-$2,655", net: "$13,865", status: "Ready", avatar: "https://i.pravatar.cc/150?u=3" },
  { name: "Meera Park", id: "EMP-1003", role: "Legal", base: "$9,042", allowances: "+$1,085", deductions: "-$1,627", net: "$8,499", status: "Ready", avatar: "https://i.pravatar.cc/150?u=4" },
  { name: "Vikram Miller", id: "EMP-1004", role: "Data & Analytics", base: "$10,833", allowances: "+$1,300", deductions: "-$1,950", net: "$10,183", status: "Ready", avatar: "https://i.pravatar.cc/150?u=5" },
  { name: "Aiko Hassan", id: "EMP-1005", role: "Data & Analytics", base: "$9,708", allowances: "+$1,165", deductions: "-$1,748", net: "$9,126", status: "Ready", avatar: "https://i.pravatar.cc/150?u=6" },
  { name: "Jack Suzuki", id: "EMP-1006", role: "IT Ops", base: "$8,333", allowances: "+$1,000", deductions: "-$1,500", net: "$7,833", status: "Ready", avatar: "https://i.pravatar.cc/150?u=7" },
  { name: "Priya Wilson", id: "EMP-1007", role: "Product", base: "$11,333", allowances: "+$1,360", deductions: "-$2,040", net: "$10,653", status: "Ready", avatar: "https://i.pravatar.cc/150?u=8" }
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

export default function Payroll() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Finance</div>
            <h1 className="truncate text-3xl font-semibold tracking-tight">Payroll</h1>
            <p className="mt-1 text-sm text-muted-foreground">Attendance-linked payroll with automatic calculation, approvals and bank transfers.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 bg-background border border-border hover:bg-muted text-foreground h-10 px-4 rounded-full text-sm font-medium transition-colors shadow-sm">
              <Download className="h-4 w-4" /> Export payslips
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 rounded-full text-sm font-medium transition-colors shadow-sm">
              <Play className="h-4 w-4 fill-white" /> Run July payroll
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {payrollStats.map((stat, i) => (
            <div key={i} className="card-elevated p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-semibold mt-2 truncate">{stat.value}</h3>
                </div>
                <div className={`p-2 rounded-full ${stat.title === 'July payroll' ? 'bg-green-100 dark:bg-green-500/20' : stat.title === 'Bonuses' ? 'bg-blue-100 dark:bg-blue-500/20' : stat.title === 'Approvals' ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-green-100 dark:bg-green-500/20'}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                {stat.change ? (
                  <>
                    <div className={`flex items-center gap-1 font-medium rounded px-1.5 py-0.5 ${
                      stat.isPositive ? 'text-green-700 bg-green-50 dark:bg-green-500/20 dark:text-green-400' : 'text-red-700 bg-red-50 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {stat.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
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

        {/* Progress Bars */}
        <div className="card-elevated p-6 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {progressSteps.map((step, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm font-medium mb-2 text-muted-foreground">
                  <span>{step.title}</span>
                  <span>{step.value}%</span>
                </div>
                <div className="h-2.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${step.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-6">12-month payroll cost ($M)</h3>
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-border" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} minTickGap={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} ticks={[0, 2, 4, 6, 8]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }}
                  />
                  <Line type="monotone" dataKey="payroll" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: 'hsl(var(--card))' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="bonuses" stroke="#eab308" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: 'hsl(var(--card))' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-6">Cost by department ($K / mo)</h3>
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentCosts} margin={{ top: 10, right: 10, left: -10, bottom: 40 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-border" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={<CustomTick />} 
                    interval={0}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} ticks={[0, 80, 160, 240, 320]} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }} 
                  />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="card-elevated">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h3 className="text-base font-semibold">July payslip preview</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Auto-generated from attendance & leaves</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-semibold">
              Draft
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground font-medium border-b border-border bg-muted/20">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Base</th>
                  <th className="px-6 py-4 font-medium">Allowances</th>
                  <th className="px-6 py-4 font-medium">Deductions</th>
                  <th className="px-6 py-4 font-medium">Net pay</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payslipPreview.map((user, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-border" />
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{user.role}</td>
                    <td className="px-6 py-4 font-medium">{user.base}</td>
                    <td className="px-6 py-4 font-medium text-green-600 dark:text-green-500">{user.allowances}</td>
                    <td className="px-6 py-4 font-medium text-red-600 dark:text-red-500">{user.deductions}</td>
                    <td className="px-6 py-4 font-semibold">{user.net}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-green-200 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
