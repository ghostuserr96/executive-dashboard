import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarClock, Wallet, PlaneTakeoff,
  Award, Briefcase, GraduationCap, ListChecks,
  ChartLine, Bot, Megaphone, FileText,
  Building2, MessageSquare, Settings, X,
  Bell, UserCheck
} from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

function SidebarContent({ onItemClick }) {
  const { employees = [], leaves = [], tasks = [] } = useDataContext();
  const { isHRAdmin, activeRole, switchRole } = useAuth();

  const employeeCount = employees.length;
  const pendingLeaveCount = leaves.filter(l => l.status === 'Pending').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed').length;

  return (
    <>
      <div className="flex h-16 items-center justify-between gap-2.5 px-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow shrink-0 font-bold text-sm">
            N
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-sidebar-foreground">Northwind Labs</div>
            <div className="truncate text-[11px] text-muted-foreground">Enterprise · Global</div>
          </div>
        </div>
        {onItemClick && (
          <button
            onClick={onItemClick}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <div dir="ltr" className="relative overflow-hidden flex-1 min-h-0">
        <div className="h-full w-full overflow-y-auto no-scrollbar">
          <nav className="px-3 py-4 space-y-6">
            
            {/* Workspace */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</div>
              <ul className="space-y-0.5">
                <li>
                  <NavLink to="/" end onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
                      <>
                        <LayoutDashboard className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        <span className="flex-1 truncate">Dashboard</span>
                      </>
                    )}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/employees" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
                      <>
                        <Users className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        <span className="flex-1 truncate">Employees</span>
                        <div className={`inline-flex items-center rounded-full py-0.5 transition-colors h-5 px-2 text-[10px] font-semibold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                          {employeeCount}
                        </div>
                      </>
                    )}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/attendance" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <CalendarClock className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Attendance</span>
  </>
)}
                  </NavLink>
                </li>
                {isHRAdmin && (
                  <li>
                    <NavLink to="/payroll" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                      {({ isActive }) => (
  <>
    <Wallet className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Payroll</span>
  </>
)}
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink to="/leave" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
                      <>
                        <PlaneTakeoff className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        <span className="flex-1 truncate">Leave</span>
                        {isHRAdmin && pendingLeaveCount > 0 && (
                          <div className="inline-flex items-center rounded-md border py-0.5 border-transparent bg-amber-500/10 text-amber-500 font-bold h-5 px-1.5 text-[10px]">
                            {pendingLeaveCount}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Talent */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Talent</div>
              <ul className="space-y-0.5">
                <li>
                  <NavLink to="/performance" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <Award className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Performance</span>
  </>
)}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/recruitment" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <Briefcase className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Recruitment</span>
  </>
)}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/ai-resume-screening" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <UserCheck className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">AI Resume Screening</span>
  </>
)}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/learning" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <GraduationCap className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Learning</span>
  </>
)}
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Productivity */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Productivity</div>
              <ul className="space-y-0.5">
                <li>
                  <NavLink to="/tasks" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
                      <>
                        <ListChecks className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        <span className="flex-1 truncate">Tasks</span>
                        {pendingTasksCount > 0 && (
                          <div className="inline-flex items-center rounded-md border py-0.5 border-transparent bg-secondary text-secondary-foreground h-5 px-1.5 text-[10px] font-semibold">
                            {pendingTasksCount}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/analytics" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <ChartLine className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Analytics</span>
  </>
)}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/ai-insights" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <Bot className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">AI Insights</span>
  </>
)}
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Company</div>
              <ul className="space-y-0.5">
                <li>
                  <NavLink to="/announcements" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <Megaphone className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Announcements</span>
  </>
)}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/documents" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <FileText className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Documents</span>
  </>
)}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/organization" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <Building2 className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Organization</span>
  </>
)}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/messaging" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Messaging</span>
  </>
)}
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* System */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">System</div>
              <ul className="space-y-0.5">
                <li>
                  <NavLink to="/settings" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
  <>
    <Settings className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1 truncate">Settings</span>
  </>
)}
                  </NavLink>
                </li>
              </ul>
            </div>

          </nav>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <>
      <aside className="hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-sidebar border-r border-sidebar-border text-sidebar-foreground flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <SidebarContent onItemClick={() => setMobileMenuOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
