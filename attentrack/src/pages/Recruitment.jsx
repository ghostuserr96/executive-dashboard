import React from 'react';
import {
  Users,
  UserPlus,
  Star,
  TrendingUp,
  TrendingDown,
  Plus,
  MapPin,
  Users2
} from 'lucide-react';

// Mock Data
const recruitmentStats = [
  {
    title: 'Open roles',
    value: '6',
    change: '+12.0%',
    isPositive: true,
    icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-500" />,
    bg: 'bg-blue-50 dark:bg-blue-500/10'
  },
  {
    title: 'Candidates',
    value: '1240',
    change: '+22.0%',
    isPositive: true,
    icon: <UserPlus className="h-5 w-5 text-green-600 dark:text-green-500" />,
    bg: 'bg-green-50 dark:bg-green-500/10'
  },
  {
    title: 'Time to hire',
    value: '25d',
    change: '-14.0%',
    isPositive: false,
    icon: <Star className="h-5 w-5 text-green-600 dark:text-green-500" />,
    bg: 'bg-green-50 dark:bg-green-500/10'
  },
  {
    title: 'Offer acceptance',
    value: '87%',
    change: '+3.2%',
    isPositive: true,
    icon: <Star className="h-5 w-5 text-green-600 dark:text-green-500" />,
    bg: 'bg-green-50 dark:bg-green-500/10'
  }
];

const pipelineStages = [
  {
    name: 'Applied', count: 1240, 
    candidate: { initials: 'SN', name: 'Sara Nguyen', role: 'Staff Product Designer', source: 'Referral', score: 94 }
  },
  {
    name: 'Screening', count: 486, 
    candidate: { initials: 'MR', name: 'Marcus Reilly', role: 'Senior Backend Engin...', source: 'LinkedIn', score: 88 }
  },
  {
    name: 'Interview', count: 182, 
    candidate: { initials: 'AT', name: 'Aiko Tanaka', role: 'Enterprise AE', source: 'Inbound', score: 91 }
  },
  {
    name: 'Onsite', count: 48, 
    candidate: { initials: 'DM', name: 'Diego Martinez', role: 'Data Scientist', source: 'Job Board', score: 82 }
  },
  {
    name: 'Offer', count: 31, 
    candidate: { initials: 'LA', name: 'Layla Ahmed', role: 'People Ops Manager', source: 'Referral', score: 86 }
  },
  {
    name: 'Hired', count: 5, 
    candidate: { initials: 'OC', name: 'Owen Clark', role: 'DevOps Engineer', source: 'Sourced', score: 79 }
  },
];

const jobPostings = [
  { id: 'JR-201', title: 'Staff Product Designer', department: 'Design', location: 'Remote', applicants: 184, progress: 46, status: 'Interview' },
  { id: 'JR-202', title: 'Senior Backend Engineer', department: 'Engineering', location: 'New York', applicants: 246, progress: 61, status: 'Screening' },
  { id: 'JR-203', title: 'Enterprise Account Executive', department: 'Sales', location: 'London', applicants: 92, progress: 23, status: 'Offer' },
  { id: 'JR-204', title: 'People Ops Manager', department: 'People Ops', location: 'San Francisco', applicants: 128, progress: 32, status: 'Interview' },
  { id: 'JR-205', title: 'Data Scientist', department: 'Data & Analytics', location: 'Bangalore', applicants: 312, progress: 78, status: 'Screening' },
  { id: 'JR-206', title: 'DevOps Engineer', department: 'IT Ops', location: 'Singapore', applicants: 78, progress: 19, status: 'Interview' }
];

export default function Recruitment() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-500">Talent Acquisition</div>
            <h1 className="truncate text-3xl font-semibold tracking-tight">Recruitment</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track jobs, pipeline and candidates. AI-ranked profiles and offer workflows.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 h-10 px-5 rounded-full text-sm font-medium transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> Post a role
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recruitmentStats.map((stat, i) => (
            <div key={i} className="card-elevated hover-lift p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-semibold mt-2 truncate">{stat.value}</h3>
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
                      {stat.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.change}
                    </div>
                    <span className="text-muted-foreground">vs last month</span>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline Section */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Pipeline</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Drag candidates between stages</p>
            </div>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">This month</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {pipelineStages.map((stage, i) => (
              <div key={i} className="min-w-[220px] flex-1 bg-muted/20 border border-border/50 rounded-2xl p-4">
                <div className="flex items-center justify-between font-semibold text-sm mb-4">
                  <span>{stage.name}</span>
                  <span className="text-muted-foreground">{stage.count}</span>
                </div>
                
                <div className="bg-background border border-border/80 shadow-sm rounded-xl p-3 hover:border-border transition-colors cursor-pointer">
                  <div className="flex gap-3 items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0 border border-border/50">
                      {stage.candidate.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate text-foreground">{stage.candidate.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5">{stage.candidate.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{stage.candidate.source}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{stage.candidate.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Postings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobPostings.map((job, i) => (
            <div key={i} className="card-elevated hover-lift p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <span className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground bg-muted rounded-full border border-border/50">
                  {job.id}
                </span>
                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                  job.status === 'Interview' ? 'border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                  job.status === 'Screening' ? 'border-cyan-200 bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20' :
                  'border-indigo-200 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
                }`}>
                  {job.status}
                </span>
              </div>
              
              <h3 className="font-semibold text-base mb-1 truncate">{job.title}</h3>
              <p className="text-sm text-muted-foreground mb-5">{job.department}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users2 className="w-4 h-4" />
                  {job.applicants} applicants
                </div>
              </div>
              
              <div className="mt-auto pt-2 border-t border-border border-dashed">
                <div className="flex items-center justify-between text-xs mb-2 mt-4">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{job.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${job.progress}%` }} />
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex-1 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-full hover:bg-muted transition-colors">
                    View
                  </button>
                  <button className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                    Shortlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
