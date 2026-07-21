import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  XCircle,
  Camera,
  MapPin,
  QrCode,
  Wifi,
  ScanFace,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';

// Mock Data
const attendanceStats = [
  {
    title: 'Checked in',
    value: '218',
    change: '+2.1%',
    isPositive: true,
    icon: <CheckCircle className="h-5 w-5 text-green-500" />
  },
  {
    title: 'Late',
    value: '14',
    change: '-8.2%',
    isPositive: false,
    icon: <Clock className="h-5 w-5 text-amber-500" />
  },
  {
    title: 'Absent',
    value: '9',
    change: '-1.4%',
    isPositive: false,
    icon: <XCircle className="h-5 w-5 text-red-500" />
  },
  {
    title: 'Avg. hours',
    value: '8h 24m',
    change: '+0.6%',
    isPositive: true,
    icon: <Clock className="h-5 w-5 text-blue-500" />
  }
];

const attendanceArea = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: 200 + Math.sin(i / 3) * 15 + Math.random() * 10
}));

const checkInMethods = [
  { name: 'Selfie', value: 85, icon: Camera },
  { name: 'GPS', value: 62, icon: MapPin },
  { name: 'QR', value: 40, icon: QrCode },
  { name: 'WIFI', value: 24, icon: Wifi },
  { name: 'Face', value: 8, icon: ScanFace },
];

const recentCheckIns = [
  { name: "Aiko Suzuki", role: "Legal", location: "Singapore", method: "Selfie", methodIcon: Camera, time: "8:00 AM", status: "On time", avatar: "https://i.pravatar.cc/150?u=1" },
  { name: "Mateo Watanabe", role: "IT Ops", location: "Singapore", method: "GPS", methodIcon: MapPin, time: "8:11 AM", status: "On time", avatar: "https://i.pravatar.cc/150?u=2" },
  { name: "Hiro White", role: "Design", location: "Singapore", method: "QR", methodIcon: QrCode, time: "8:22 AM", status: "Late", avatar: "https://i.pravatar.cc/150?u=3" },
  { name: "Meera Park", role: "Legal", location: "London", method: "WiFi", methodIcon: Wifi, time: "9:33 AM", status: "On time", avatar: "https://i.pravatar.cc/150?u=4" },
  { name: "Vikram Miller", role: "Data & Analytics", location: "Bangalore", method: "Face", methodIcon: ScanFace, time: "9:44 AM", status: "On time", avatar: "https://i.pravatar.cc/150?u=5" },
  { name: "Aiko Hassan", role: "Data & Analytics", location: "Bangalore", method: "Selfie", methodIcon: Camera, time: "9:55 AM", status: "Late", avatar: "https://i.pravatar.cc/150?u=6" },
  { name: "Jack Suzuki", role: "IT Ops", location: "London", method: "GPS", methodIcon: MapPin, time: "10:06 AM", status: "On time", avatar: "https://i.pravatar.cc/150?u=7" },
  { name: "Priya Wilson", role: "Product", location: "New York", method: "QR", methodIcon: QrCode, time: "10:17 AM", status: "On time", avatar: "https://i.pravatar.cc/150?u=8" }
];

// Helper to format custom tick in Recharts
const CustomTick = (props) => {
  const { x, y, payload } = props;
  const method = checkInMethods.find(m => m.name === payload.value);
  const Icon = method?.icon;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize="12">
        {payload.value}
      </text>
      {Icon && <Icon x={-8} y={32} className="h-4 w-4 text-muted-foreground" />}
    </g>
  );
};


export default function Attendance() {
  const [timeRange, setTimeRange] = useState('Daily');

  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Time & Attendance</div>
            <h1 className="truncate text-3xl font-semibold tracking-tight">Attendance</h1>
            <p className="mt-1 text-sm text-muted-foreground">Real-time attendance with geo-fenced, selfie, QR and WiFi verification.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-muted p-1 rounded-full w-full md:w-auto overflow-x-auto scrollbar-hide">
              {['Daily', 'Monthly', 'Shifts'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                    timeRange === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {attendanceStats.map((stat, i) => (
            <div key={i} className="card-elevated hover-lift p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-semibold mt-2 truncate">{stat.value}</h3>
                </div>
                <div className={`p-2 rounded-full ${stat.title === 'Checked in' ? 'bg-green-100 dark:bg-green-500/20' : stat.title === 'Late' ? 'bg-amber-100 dark:bg-amber-500/20' : stat.title === 'Absent' ? 'bg-red-100 dark:bg-red-500/20' : 'bg-blue-100 dark:bg-blue-500/20'}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <div className={`flex items-center gap-1 font-medium rounded px-1.5 py-0.5 ${
                  stat.isPositive ? 'text-green-700 bg-green-50 dark:bg-green-500/20 dark:text-green-400' : 'text-red-700 bg-red-50 dark:bg-red-500/20 dark:text-red-400'
                }`}>
                  {stat.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </div>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-elevated p-6 lg:col-span-2 flex flex-col">
            <h3 className="text-base font-semibold mb-6">30-day attendance</h3>
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceArea} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} minTickGap={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} ticks={[0, 60, 120, 180, 240]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAttendance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-6">Check-in methods</h3>
            <div className="h-[280px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={checkInMethods} margin={{ top: 10, right: 10, left: -20, bottom: 40 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={<CustomTick />} 
                    interval={0}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} ticks={[0, 25, 50, 75, 100]} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
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
              <h3 className="text-base font-semibold">Recent check-ins</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Verified with multiple factors</p>
            </div>
            <button className="text-sm font-medium hover:text-primary transition-colors">View all</button>
          </div>
          
          <div className="p-2">
            {recentCheckIns.map((user, i) => {
              const MethodIcon = user.methodIcon;
              return (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50 rounded-xl transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-border" />
                    <div>
                      <h4 className="text-sm font-medium">{user.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{user.role} · {user.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-12 ml-14 sm:ml-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground w-20 justify-center">
                      <MethodIcon className="h-3.5 w-3.5" />
                      {user.method}
                    </div>
                    
                    <div className="text-sm font-medium w-16 text-right">
                      {user.time}
                    </div>
                    
                    <div className="w-20 flex justify-end">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        user.status === 'On time' 
                          ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
                          : 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}
