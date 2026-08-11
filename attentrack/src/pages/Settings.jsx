import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Briefcase, Building, Shield, Bell, Eye, KeyRound, Save,
  CheckCircle, AlertCircle, Loader2, Lock, Moon, Sun, Clock, Calendar,
  DollarSign, Wallet, Users, ChevronRight, Camera, Upload, Palette,
  ToggleLeft, Megaphone, MessageSquare, CheckSquare, LogOut, Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { useNavigate } from 'react-router-dom';


/* ─── Helpers ──────────────────────────────────────── */
const getInitials = (name) => {
  if (!name) return 'AT';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const loadLocal = (key, defaults) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch { return defaults; }
};

const saveLocal = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { }
};

/* ─── Reusable Components ──────────────────────────── */
const ToggleSwitch = ({ isOn, onToggle, disabled }) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    className={`w-11 h-6 rounded-full flex items-center transition-all px-0.5 cursor-pointer shrink-0 ${isOn ? 'bg-primary' : 'bg-muted-foreground/30'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    aria-checked={isOn}
    role="switch"
    type="button"
  >
    <div className={`w-5 h-5 rounded-full bg-background shadow-sm transition-transform duration-200 ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const Label = ({ children }) => (
  <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">{children}</label>
);

const inputCls = "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all";

const ReadOnly = ({ value, icon: Icon }) => (
  <div className="flex items-center gap-2 w-full bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5 text-[14px] text-muted-foreground">
    {Icon && <Icon className="w-4 h-4 shrink-0 opacity-60" />}
    <span className="truncate">{value || '—'}</span>
  </div>
);

const Toast = ({ msg }) => msg ? (
  <div className={`flex items-center gap-2 p-3 rounded-xl text-[13px] ${msg.isError ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
    {msg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
    {msg.text}
  </div>
) : null;

const SaveBtn = ({ saving, label = 'Save Changes', icon: Icon = Save }) => (
  <button
    type="submit"
    disabled={saving}
    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-[14px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer"
  >
    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
    {saving ? 'Saving…' : label}
  </button>
);

const SectionTitle = ({ children }) => (
  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4 mt-6 first:mt-0">{children}</h4>
);



/* ─── TABS ─────────────────────────────────────────── */
const TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function Settings() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');


  /* ─── Profile ─── */
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: '', bio: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({ ...prev, name: user.name || '' }));
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { setProfileMsg({ isError: true, text: 'Name cannot be empty.' }); return; }
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        try {
          const reader = new FileReader();
          const base64 = await new Promise((res) => { reader.onloadend = () => res(reader.result); reader.readAsDataURL(avatarFile); });
          const uploadRes = await apiClient('/upload/base64', { method: 'POST', body: { image: base64, folder: 'avatars' } });
          if (uploadRes?.data?.url) avatarUrl = uploadRes.data.url;
        } catch { }
      }
      const updatedProfile = await apiClient('/auth/me', {
        method: 'PUT',
        body: { name: profileForm.name.trim(), avatar: avatarUrl },
      });
      if (updatedProfile?.data) {
        setUser(updatedProfile.data);
      }
      setProfileMsg({ isError: false, text: 'Profile updated successfully!' });
      setAvatarFile(null);
    } catch (err) {
      setProfileMsg({ isError: true, text: err.message || 'Failed to save profile.' });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  /* ─── Password ─── */
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [savingPwd, setSavingPwd] = useState(false);
  const handlePwdSave = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { setPwdMsg({ isError: true, text: 'New passwords do not match.' }); return; }
    if (pwdForm.newPassword.length < 6) { setPwdMsg({ isError: true, text: 'Password must be at least 6 characters.' }); return; }
    setSavingPwd(true); setPwdMsg(null);
    try {
      await apiClient('/auth/change-password', { method: 'POST', body: { userId: user?.id, currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword } });
      setPwdMsg({ isError: false, text: 'Password updated successfully!' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdMsg({ isError: true, text: err.message || 'Failed to update password.' });
    } finally {
      setSavingPwd(false);
      setTimeout(() => setPwdMsg(null), 4000);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                <div className="w-24 h-24 rounded-2xl border-4 border-border bg-primary/10 overflow-hidden shadow-lg">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">
                      {getInitials(user?.name)}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-foreground" />
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-[15px]">{user?.name || 'User'}</h3>
                <p className="text-[13px] text-muted-foreground">{user?.email}</p>
                <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-primary font-semibold hover:underline cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Change photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Display Name</Label>
                <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className={inputCls} placeholder="Your full name" />
              </div>
              <div>
                <Label>Department</Label>
                <ReadOnly value={user?.department || '—'} icon={Building} />
              </div>
              <div>
                <Label>Email Address</Label>
                <ReadOnly value={user?.email} icon={Mail} />
                <p className="text-[11px] text-muted-foreground mt-1">Contact your admin to change email.</p>
              </div>
              <div>
                <Label>Role</Label>
                <ReadOnly value={user?.role} icon={Briefcase} />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className={inputCls} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div>
              <Label>Bio (optional)</Label>
              <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} className={inputCls + ' resize-none'} placeholder="Tell your team a bit about yourself…" />
            </div>
            <Toast msg={profileMsg} />
            <div className="flex justify-end"><SaveBtn saving={savingProfile} label="Save Profile" /></div>
          </form>
        );

      case 'security':
        return (
          <div className="space-y-8">
            <form onSubmit={handlePwdSave} className="space-y-5">
              <SectionTitle>Change Password</SectionTitle>
              <div>
                <Label>Current Password</Label>
                <input type="password" value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} className={inputCls} placeholder="Your current password" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>New Password</Label>
                  <input type="password" value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} className={inputCls} placeholder="Min. 6 characters" required />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <input type="password" value={pwdForm.confirmPassword} onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} className={inputCls} placeholder="Repeat new password" required />
                </div>
              </div>
              <Toast msg={pwdMsg} />
              <div className="flex justify-end"><SaveBtn saving={savingPwd} label="Update Password" icon={KeyRound} /></div>
            </form>
          </div>
        );


      default: return null;
    }
  };

  const activeTabObj = TABS.find((t) => t.id === activeTab);
  const ActiveTabIcon = activeTabObj?.icon ?? null;

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1300px] p-4 lg:p-8">

        {/* Page Header */}
        <div className="pt-2 mb-6">
          <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-2">Account</div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Settings</h1>
          <p className="text-[15px] text-muted-foreground">Manage your profile, security, and organization preferences.</p>
        </div>

        {/* Profile Banner */}
        <div className="card-elevated border border-border rounded-2xl bg-card overflow-hidden mb-6">
          <div className="h-16 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
          <div className="px-6 pb-5 -mt-8 flex items-end gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl border-4 border-card bg-primary/10 overflow-hidden shadow-lg shrink-0 cursor-pointer" onClick={() => setActiveTab('profile')}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                  {getInitials(user?.name)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 mb-1">
              <h2 className="text-lg font-bold text-foreground">{user?.name || 'User'}</h2>
              <p className="text-[13px] text-muted-foreground">{user?.email} · <span className="text-primary font-medium">{user?.role}</span></p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar Nav */}
          <div className="lg:w-56 shrink-0">
            <div className="card-elevated border border-border rounded-2xl bg-card p-2 sticky top-6">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all cursor-pointer text-left ${activeTab === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                  {activeTab === id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="card-elevated border border-border rounded-2xl bg-card p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
                {ActiveTabIcon && (
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ActiveTabIcon className="w-[18px] h-[18px]" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-[16px] text-foreground">{activeTabObj?.label}</h3>
                  <p className="text-[12px] text-muted-foreground">
                    {activeTab === 'profile' && 'Update your personal info and profile picture'}
                    {activeTab === 'security' && 'Manage your password and active sessions'}
                  </p>
                </div>
              </div>
              {renderTab()}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
