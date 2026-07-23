import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CalendarClock, Wallet, PlaneTakeoff, 
  Award, Briefcase, GraduationCap, ListChecks, 
  ChartLine, Sparkles, Megaphone, FileText, 
  Building2, MessageSquare, Settings, X
} from 'lucide-react';

function SidebarContent({ onItemClick }) {
  return (
    <>
      <div className="flex h-16 items-center justify-between gap-2.5 px-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow shrink-0">
            <span className="text-sm font-bold tracking-tight">N</span>
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
        <div className="h-full w-full overflow-y-auto scrollbar-hide">
          <nav className="px-3 py-4 space-y-6">
            
            {/* Workspace */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</div>
              <ul className="space-y-0.5">
                <li>
                  <NavLink to="/" end onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <LayoutDashboard className="h-4 w-4 shrink-0 text-primary" />
                    <span className="flex-1 truncate">Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/employees" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    {({ isActive }) => (
                      <>
                        <Users className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        <span className="flex-1 truncate">Employees</span>
                        <div className={`inline-flex items-center rounded-full py-0.5 transition-colors h-5 px-2 text-[10px] font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>250</div>
                      </>
                    )}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/attendance" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Attendance</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/payroll" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <Wallet className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Payroll</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/leave" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <PlaneTakeoff className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Leave</span>
                    <div className="inline-flex items-center rounded-md border py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 h-5 px-1.5 text-[10px] font-medium">4</div>
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
                    <Award className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Performance</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/recruitment" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Recruitment</span>
                    <div className="inline-flex items-center rounded-md border py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 h-5 px-1.5 text-[10px] font-medium">6</div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/learning" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Learning</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/tasks" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <ListChecks className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Tasks</span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Intelligence */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Intelligence</div>
              <ul className="space-y-0.5">
                <li>
                  <NavLink to="/analytics" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <ChartLine className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Analytics</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/ai-insights" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">AI Copilot</span>
                    <div className="inline-flex items-center rounded-md border py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 h-5 px-1.5 text-[10px] font-medium bg-info/10 text-info">New</div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/announcements" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <Megaphone className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Announcements</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/documents" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Documents</span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Admin */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Admin</div>
              <ul className="space-y-0.5">
                <li>
                  <NavLink to="/organization" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Organization</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/messaging" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Messaging</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings" onClick={onItemClick} className={({ isActive }) => `group flex items-center gap-2.5 rounded-full px-2.5 py-2 text-sm transition-all font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
                    <Settings className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 truncate">Settings</span>
                  </NavLink>
                </li>
              </ul>
            </div>

          </nav>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-3 shrink-0">
        <div className="rounded-xl border border-sidebar-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>AI Copilot</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">&quot;5 employees at attrition risk this week. Shall I draft 1:1 invites?&quot;</p>
          <NavLink to="/ai-insights" onClick={onItemClick} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-md px-3 mt-2 h-7 w-full text-xs">Open Copilot</NavLink>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setMobileMenuOpen(false)} 
            aria-hidden="true"
          />
          {/* Drawer content */}
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-sidebar border-r border-sidebar-border h-full shadow-2xl z-10">
            <SidebarContent onItemClick={() => setMobileMenuOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
