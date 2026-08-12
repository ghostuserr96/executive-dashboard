import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Calendar,
  Clock,
  CheckSquare,
  Bell,
  Settings as SettingsIcon,
  LayoutDashboard,
  Bot,
  ArrowRight,
  UserPlus,
  FileText,
  DollarSign,
  ShieldAlert,
  BookOpen,
  X
} from 'lucide-react';
import { useDataContext } from '../../context/DataContext';

const defaultSeedEmployees = [];



export const CommandPaletteModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { employees: contextEmployees, documents: contextDocuments } = useDataContext();

  const activeEmployees = useMemo(() => {
    return (contextEmployees && contextEmployees.length > 0)
      ? contextEmployees
      : defaultSeedEmployees;
  }, [contextEmployees]);

  const pages = useMemo(() => [
    { name: 'Dashboard Command Center', path: '/', category: 'Pages', icon: LayoutDashboard },
    { name: 'Employee Directory', path: '/employees', category: 'Pages', icon: Users },
    { name: 'Attendance & Time tracking', path: '/attendance', category: 'Pages', icon: Clock },
    { name: 'Leave Management', path: '/leave', category: 'Pages', icon: Calendar },
    { name: 'Payroll & Compensation', path: '/payroll', category: 'Pages', icon: DollarSign },
    { name: 'Tasks & Projects Kanban', path: '/tasks', category: 'Pages', icon: CheckSquare },
    { name: 'Documents & Policy Vault', path: '/documents', category: 'Pages', icon: BookOpen },
    { name: 'Company Announcements', path: '/announcements', category: 'Pages', icon: Bell },
    { name: 'Insights', path: '/ai-insights', category: 'Pages', icon: Bot },
    { name: 'Account Settings', path: '/settings', category: 'Pages', icon: SettingsIcon },
  ], []);

  const quickActions = useMemo(() => [
    { name: 'Add New Employee', path: '/employees', category: 'Quick Actions', icon: UserPlus },
    { name: 'Clock In / Clock Out', path: '/attendance', category: 'Quick Actions', icon: Clock },
    { name: 'Apply for Leave', path: '/leave', category: 'Quick Actions', icon: Calendar },
    { name: 'Create Task Deliverable', path: '/tasks', category: 'Quick Actions', icon: CheckSquare }
  ], []);

  const employeeResults = useMemo(() => {
    return activeEmployees.map((emp) => ({
      name: `${emp.name} — ${emp.role}`,
      subtitle: `${emp.department} · ${emp.email}`,
      rawName: emp.name,
      rawRole: emp.role,
      rawDept: emp.department,
      rawEmail: emp.email,
      path: `/employees?search=${encodeURIComponent(emp.name)}`,
      category: 'Teammates',
      avatar: emp.avatar,
      icon: Users
    }));
  }, [activeEmployees]);

  const documentResults = useMemo(() => {
    if (!contextDocuments || !Array.isArray(contextDocuments)) return [];
    return contextDocuments
      .filter((doc) => doc.folder !== 'avatars' && doc.folder !== 'attentrack/employees')
      .map((doc) => ({
        name: doc.name,
        subtitle: `${doc.folder || 'General'} Document`,
        rawName: doc.name,
        rawFolder: doc.folder,
        path: '/documents',
        category: 'Policies & Vault',
        icon: FileText
      }));
  }, [contextDocuments]);

  const allItems = useMemo(() => {
    return [...employeeResults, ...documentResults, ...pages, ...quickActions];
  }, [employeeResults, documentResults, pages, quickActions]);

  // Instant 0ms filtering on single character input
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 10);

    return allItems.filter(item => {
      const matchTitle = item.name && item.name.toLowerCase().includes(q);
      const matchSub = item.subtitle && item.subtitle.toLowerCase().includes(q);
      const matchCat = item.category && item.category.toLowerCase().includes(q);
      const matchRole = item.rawRole && item.rawRole.toLowerCase().includes(q);
      const matchDept = item.rawDept && item.rawDept.toLowerCase().includes(q);
      const matchEmail = item.rawEmail && item.rawEmail.toLowerCase().includes(q);

      return matchTitle || matchSub || matchCat || matchRole || matchDept || matchEmail;
    });
  }, [allItems, query]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const selectedEl = document.getElementById(`command-item-${selectedIndex}`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  const handleSelect = (item) => {
    onClose();
    navigate(item.path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-card border border-border text-card-foreground rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Instant Search Header */}
        <div className="relative flex items-center border-b border-border/80 px-4 py-3 bg-muted/40">
          <Search className="w-5 h-5 text-primary mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search employees, tasks, pages..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto no-scrollbar p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No matching employees, policies, or pages found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon || FileText;
              const isSelected = index === selectedIndex;
              return (
                <button
                  id={`command-item-${index}`}
                  key={`${item.category}-${item.name}-${index}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20'
                      : 'text-foreground/90 hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {item.avatar ? (
                      <img src={item.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-border" />
                    ) : (
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    )}
                    <div className="truncate">
                      <div className="truncate font-medium">{item.name}</div>
                      {item.subtitle && (
                        <div className={`text-xs truncate ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Footer Hint */}
        <div className="border-t border-border/80 px-4 py-2.5 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] text-foreground font-semibold">↑</kbd> <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] text-foreground font-semibold">↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] text-foreground font-semibold">↵</kbd> Select</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] text-foreground font-semibold">ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
};
