import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Search,
  Plus,
  Bell,
  Menu,
  LogOut,
  User as UserIcon,
  UserPlus,
  Clock,
  Calendar,
  CheckSquare,
  Megaphone,
  ChevronDown,
  Check,
  CalendarCheck,
  KeyRound,
  X,
  Briefcase,
  Info,
  MessageSquare,
} from 'lucide-react';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { CommandPaletteModal } from './common/CommandPaletteModal';
import { apiClient } from '../services/apiClient';

export default function Header({ onToggleMobileMenu }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  // Change Password state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwdMsg({ isError: true, text: 'New passwords do not match' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPwdMsg({ isError: true, text: 'Password must be at least 6 characters' });
      return;
    }

    setIsSubmittingPwd(true);
    setPwdMsg(null);
    try {
      await apiClient('/auth/change-password', {
        method: 'POST',
        body: {
          userId: user?.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }
      });
      setPwdMsg({ isError: false, text: 'Password updated successfully!' });
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPwdMsg(null);
      }, 1500);
    } catch (err) {
      setPwdMsg({ isError: true, text: err.message || 'Failed to update password' });
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const dropdownRef = useRef(null);
  const quickAddRef = useRef(null);
  const notificationRef = useRef(null);

  const { user, logout, isHRAdmin, activeRole, switchRole } = useAuth();
  const navigate = useNavigate();

  // Detect Operating System for shortcut badge (⌘K on Mac, Ctrl+K on Windows)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMacPlatform = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || navigator.platform);
      setIsMac(isMacPlatform);
    }
  }, []);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(event.target)) {
        setIsQuickAddOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickAddAction = (path) => {
    setIsQuickAddOpen(false);
    navigate(path, { state: { autoOpenQuickAdd: true } });
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setIsNotificationsOpen(false);
    navigate(notif.path);
  };

  const getInitials = (name) => {
    if (!name) return 'AT';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const quickAddItems = [
    { label: 'Add New Employee', path: '/employees', icon: UserPlus, description: 'Register a new teammate' },
    { label: 'Clock In / Clock Out', path: '/attendance', icon: Clock, description: 'Record time attendance' },
    { label: 'Apply for Leave', path: '/leave', icon: Calendar, description: 'Submit time off request' },
    { label: 'Create New Task', path: '/tasks', icon: CheckSquare, description: 'Assign project deliverable' },
    { label: 'Post Announcement', path: '/announcements', icon: Megaphone, description: 'Publish company notice' }
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 lg:px-8 backdrop-blur-md">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobileMenu}
          className="inline-flex lg:hidden items-center justify-center h-9 w-9 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-colors shrink-0"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Command Palette Trigger Input */}
        <div
          onClick={() => setIsCmdPaletteOpen(true)}
          className="relative flex-1 max-w-xl cursor-pointer group"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors" />
          <input
            readOnly
            className="flex h-10 w-full rounded-xl border border-transparent bg-muted/60 px-3 py-1 pl-9 pr-12 md:pr-16 text-xs md:text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none cursor-pointer"
            placeholder="Search employees, tasks, policies…"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsCmdPaletteOpen(true); }}
            className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors cursor-pointer"
          >
            {isMac ? '⌘K' : 'Ctrl + K'}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <AnimatedThemeToggler variant="hexagon" duration={600} fromCenter className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-xl" />

          {/* Quick Add Action Dropdown */}
          <div className="relative hidden md:block" ref={quickAddRef}>
            <button
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              className="items-center justify-center whitespace-nowrap font-medium transition-colors border border-input bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3.5 text-xs inline-flex gap-1.5 rounded-xl cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Quick add <ChevronDown className={`w-3 h-3 transition-transform ${isQuickAddOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickAddOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-border/60">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Quick Actions</p>
                </div>
                <div className="p-1 flex flex-col gap-1">
                  {quickAddItems.map((item, index) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuickAddAction(item.path)}
                        className="w-full flex items-center gap-3 px-2.5 py-2 text-left rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">{item.label}</div>
                          <div className="text-[10px] text-muted-foreground">{item.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Messaging Quick Access */}
          <div className="relative hidden sm:block">
            <NavLink
              to="/messaging"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-xl cursor-pointer"
              title="Messaging"
            >
              <MessageSquare className="h-[18px] w-[18px]" />
            </NavLink>
          </div>

          {/* Working Notification Center Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-xl relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background animate-pulse"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-500/10 text-rose-500 font-bold px-2 py-0.5 rounded-full border border-rose-500/20">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto custom-scrollbar p-1.5 divide-y divide-border/40">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-[13px] font-semibold text-foreground">All caught up!</p>
                      <p className="text-[11px] text-muted-foreground mt-1">No new notifications right now.</p>
                    </div>
                  ) : notifications.map((notif) => {
                    const NotifIcon = notif.icon || Info;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer ${notif.unread ? 'bg-muted/60 hover:bg-muted/90' : 'hover:bg-accent/60'
                          }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${notif.color || 'bg-primary/10 text-primary'}`}>
                          <NotifIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-semibold truncate ${notif.unread ? 'text-foreground font-bold' : 'text-foreground/90'}`}>
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                            {notif.description || notif.message}
                          </p>
                        </div>
                        {notif.unread && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 hover-lift cursor-pointer"
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 border border-indigo-500/30">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || 'User Avatar'} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-indigo-600 text-foreground text-xs font-bold">
                    {getInitials(user?.name)}
                  </span>
                )}
              </span>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-xs font-semibold text-foreground">{user?.name || 'Guest User'}</div>
                <div className="text-[10px] text-muted-foreground capitalize">{user?.role?.replace('_', ' ') || 'Employee'}</div>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border/60 bg-muted/30">
                  <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-1.5 flex flex-col gap-0.5">
                  <button
                    onClick={() => { setIsDropdownOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-2 text-left px-2.5 py-2 text-sm text-foreground/90 font-medium rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-muted-foreground" /> Profile & Settings
                  </button>
                  <button
                    onClick={() => { setIsDropdownOpen(false); setIsChangePasswordOpen(true); }}
                    className="w-full flex items-center gap-2 text-left px-2.5 py-2 text-sm text-foreground/90 font-medium rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-muted-foreground" /> Change Password
                  </button>
                </div>
                <div className="h-px bg-border/60"></div>
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left px-2.5 py-2 text-sm text-rose-500 font-medium rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setIsChangePasswordOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-400" /> Change Your Password
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Set a secure personal password for your account.</p>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password (e.g. 123456)"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">New Personal Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {pwdMsg && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${pwdMsg.isError ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
                  {pwdMsg.text}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsChangePasswordOpen(false)} className="px-4 py-2 text-xs border border-border text-foreground rounded-xl hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingPwd} className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-foreground font-semibold rounded-xl">
                  {isSubmittingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Spotlight Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
      />
    </>
  );
}
