import React from 'react';
import {
  BookOpen,
  PlayCircle,
  Award,
  Clock,
  TrendingUp,
  Play
} from 'lucide-react';

// Mock Data
const learningStats = [
  {
    title: 'Courses in flight',
    value: '38',
    change: null,
    icon: <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-500" />,
    bg: 'bg-blue-50 dark:bg-blue-500/10'
  },
  {
    title: 'Learners active',
    value: '182',
    change: '+12.0%',
    isPositive: true,
    icon: <PlayCircle className="h-5 w-5 text-green-600 dark:text-green-500" />,
    bg: 'bg-green-50 dark:bg-green-500/10'
  },
  {
    title: 'Certificates issued',
    value: '64',
    change: '+9.0%',
    isPositive: true,
    icon: <Award className="h-5 w-5 text-green-600 dark:text-green-500" />,
    bg: 'bg-green-50 dark:bg-green-500/10'
  },
  {
    title: 'Avg. weekly time',
    value: '1h 42m',
    change: null,
    icon: <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />,
    bg: 'bg-cyan-50 dark:bg-cyan-500/10'
  }
];

const courses = [
  { badge: 'Featured', category: 'Leadership', title: 'Leadership Essentials', duration: '4h 20m', enrolled: '84', progress: 62 },
  { badge: 'New', category: 'Engineering', title: 'Advanced React Patterns', duration: '6h 05m', enrolled: '46', progress: 34 },
  { badge: null, category: 'Managers', title: 'Effective 1-on-1s', duration: '1h 45m', enrolled: '122', progress: 88 },
  { badge: null, category: 'Product', title: 'Financial Fluency for PMs', duration: '3h 10m', enrolled: '52', progress: 20 },
  { badge: 'Mandatory', category: 'Compliance', title: 'Security Awareness 2026', duration: '50m', enrolled: '240', progress: 92 },
  { badge: null, category: 'Design', title: 'Design Systems Deep Dive', duration: '5h 30m', enrolled: '38', progress: 45 }
];

export default function Learning() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-500">Learning & Development</div>
            <h1 className="truncate text-3xl font-semibold tracking-tight">Learning</h1>
            <p className="mt-1 text-sm text-muted-foreground">Courses, certifications and skill development for every teammate.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 h-10 px-5 rounded-full text-sm font-medium transition-colors shadow-sm">
              Assign course
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {learningStats.map((stat, i) => (
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

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <div key={i} className="card-elevated hover-lift flex flex-col overflow-hidden">
              {/* Course Banner (Top Half) */}
              <div className="h-40 bg-gradient-to-br from-blue-500 to-sky-400 relative flex items-center justify-center group cursor-pointer">
                {course.badge && (
                  <div className="absolute top-4 left-4 bg-white dark:bg-background text-foreground px-3 py-1 text-xs font-semibold rounded-full shadow-sm">
                    {course.badge}
                  </div>
                )}
                <div className="w-14 h-14 rounded-full border-2 border-white/30 flex items-center justify-center bg-black/10 group-hover:bg-black/20 group-hover:scale-110 transition-all backdrop-blur-sm">
                  <Play className="h-6 w-6 text-white ml-1 fill-white" />
                </div>
              </div>

              {/* Course Details (Bottom Half) */}
              <div className="p-6 flex flex-col flex-1 bg-card">
                <div className="text-xs font-medium text-muted-foreground mb-1">{course.category}</div>
                <h3 className="font-semibold text-base mb-1 line-clamp-1">{course.title}</h3>
                <div className="text-xs text-muted-foreground mb-6">
                  {course.duration} &middot; {course.enrolled} enrolled
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden mb-5">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                  
                  <button className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                    Continue
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
