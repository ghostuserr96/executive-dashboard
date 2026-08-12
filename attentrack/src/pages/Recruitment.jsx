import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Star,
  TrendingUp,
  TrendingDown,
  Plus,
  MapPin,
  Users2,
  X,
  CheckCircle2,
  Share2,
  Copy,
  Mail,
  MessageSquare,
  FileText,
  Trash2,
  ExternalLink,
  Check,
  Globe,
  Target,
  RefreshCw,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataContext } from '../context/DataContext';
import { recruitmentService } from '../services/recruitmentService';
import { CustomSelect } from '../components/common/CustomSelect';

const PIPELINE_STAGES = ['Applied', 'Shortlist', 'Interview', 'Reject', 'Hire'];

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Sales',
  'Marketing',
  'Data & Analytics',
  'People Ops',
  'IT Ops',
  'Finance',
  'Legal'
];

export default function Recruitment() {
  const { recruitmentJobs = [], recruitmentCandidates = [], refreshAll } = useDataContext();

  // Modal States
  const [selectedShareJob, setSelectedShareJob] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Job Posting Form State
  const [jobFormData, setJobFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'Full-time',
    salary: '₹80,000 - ₹120,000 / year',
    description: '',
    requirements: '',
    totalOpenings: 5
  });

  // Dynamic Stats
  const stats = useMemo(() => {
    const openRoles = recruitmentJobs.filter(j => j.status === 'Open').length;
    const totalCandidates = recruitmentCandidates.length;
    const hiredCount = recruitmentCandidates.filter(c => c.stage === 'Hire' || c.stage === 'Hired').length;
    const hireRate = totalCandidates > 0 ? Math.round((hiredCount / totalCandidates) * 100) : 0;

    return [
      {
        title: 'Open Roles',
        value: String(openRoles),
        change: null,
        isPositive: true,
        icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-500" />,
        bg: 'bg-blue-50 dark:bg-blue-500/10'
      },
      {
        title: 'Total Applications',
        value: String(totalCandidates),
        change: null,
        isPositive: true,
        icon: <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-500" />,
        bg: 'bg-purple-50 dark:bg-purple-500/10'
      },
      {
        title: 'Candidates Hired',
        value: String(hiredCount),
        change: null,
        isPositive: true,
        icon: <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />,
        bg: 'bg-emerald-50 dark:bg-emerald-500/10'
      },
      {
        title: 'Hire Rate',
        value: `${hireRate}%`,
        change: null,
        isPositive: true,
        icon: <Star className="h-5 w-5 text-amber-600 dark:text-amber-500" />,
        bg: 'bg-amber-50 dark:bg-amber-500/10'
      }
    ];
  }, [recruitmentJobs, recruitmentCandidates]);

  // Stage Movement Handler (Auto-cleans Cloudinary resume when candidate reaches Hire or Reject stage)
  const handleMoveStage = async (candId, newStage) => {
    try {
      const isFinalStage = (newStage === 'Hire' || newStage === 'Reject');
      await recruitmentService.updateCandidateStage(candId, newStage, isFinalStage);
      await refreshAll();
      if (selectedCandidate && String(selectedCandidate.id) === String(candId)) {
        setSelectedCandidate(prev => ({ ...prev, stage: newStage, status: newStage }));
      }
      if (isFinalStage) {
        setSuccessMsg(`Candidate stage updated to '${newStage}'! Resume file cleaned up automatically.`);
        setTimeout(() => setSuccessMsg(''), 7000);
      }
    } catch (err) {
      alert('Failed moving candidate stage: ' + (err.message || 'Error'));
    }
  };

  // Delete Candidate & Clean Up Resume
  const handleDeleteCandidate = async (candId, candName) => {
    if (!window.confirm(`Are you sure you want to delete applicant "${candName}"? Their application record and resume will both be permanently deleted.`)) return;
    try {
      await recruitmentService.deleteCandidate(candId);
      await refreshAll();
      if (selectedCandidate && String(selectedCandidate.id) === String(candId)) {
        setSelectedCandidate(null);
      }
      setSuccessMsg(`Candidate "${candName}" and resume file deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 7000);
    } catch (err) {
      alert('Failed deleting candidate: ' + (err.message || 'Error'));
    }
  };


  // Job Posting Submission
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobFormData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await recruitmentService.createJob(jobFormData);
      await refreshAll();
      setIsPostModalOpen(false);

      const createdJob = res?.data;
      const publicSlug = createdJob?.slug || createdJob?.title?.toLowerCase().replace(/\s+/g, '-');

      setSuccessMsg(`Job "${jobFormData.title}" posted! Public Application Link generated: /apply/${publicSlug}`);
      setTimeout(() => setSuccessMsg(''), 8000);

      setJobFormData({
        title: '',
        department: 'Engineering',
        location: 'Remote',
        employmentType: 'Full-time',
        salary: '₹80,000 - ₹120,000 / year',
        description: '',
        requirements: '',
        totalOpenings: 5
      });
    } catch (err) {
      alert('Failed posting job: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Job Handler
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? All associated candidate data will also be cleaned up.')) return;
    try {
      await recruitmentService.deleteJob(jobId);
      await refreshAll();
    } catch (err) {
      alert('Failed deleting job posting');
    }
  };

  // Helper to generate public application link
  const getPublicLink = (job) => {
    const slug = job?.slug || (job?.title ? job.title.toLowerCase().replace(/\s+/g, '-') : job?.id);
    return `${window.location.origin}/apply/${slug}`;
  };

  // Copy Form Link
  const handleCopyLink = (job) => {
    const link = getPublicLink(job);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const departmentOptions = DEPARTMENTS.map(d => ({ label: d, value: d }));

  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">

        {/* Banner Notification */}
        {successMsg && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Recruitment</div>
            <h1 className="truncate text-3xl font-bold tracking-tight text-foreground">Job Postings & Applications</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage job requisitions and review candidate applications.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => refreshAll()}
              className="flex items-center gap-2 bg-background border border-border text-foreground hover:bg-muted h-10 px-4 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-sm whitespace-nowrap"
            >
              <RefreshCw className="h-4 w-4 text-primary" />
              Refresh Applications
            </button>

            <button
              onClick={() => setIsPostModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-5 rounded-full text-sm font-semibold transition-all shadow-md shadow-primary/20 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> Create Job Posting
            </button>
          </div>
        </div>


        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="card-elevated hover-lift p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-2 truncate text-foreground">{stat.value}</h3>
                </div>
                <div className={`p-2.5 rounded-2xl border border-border/50 ${stat.bg}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                {stat.change && (
                  <div className={`flex items-center gap-1 font-medium rounded-lg px-2 py-0.5 text-xs ${
                    stat.isPositive ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-500/20 dark:text-emerald-400' : 'text-rose-700 bg-rose-50 dark:bg-rose-500/20 dark:text-rose-400'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </div>
                )}
                <span className="text-muted-foreground text-xs">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Active Job Requisitions Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Active Job Openings</h3>
              <p className="text-xs text-muted-foreground">Every active job has a public application page link (`/apply/:slug`)</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
              {recruitmentJobs.length} Active Roles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recruitmentJobs.map((job) => {
              const jobCandidates = recruitmentCandidates.filter(c => String(c.jobId) === String(job.id) || c.role === job.title);
              const hiredCount = recruitmentCandidates.filter(c => (c.role === job.title || String(c.jobId) === String(job.id)) && (c.stage === 'Hire' || c.stage === 'Hired')).length;
              const totalOpenings = Number(job.totalOpenings) || 5;
              const calculatedProgress = Math.min(100, Math.round((hiredCount / totalOpenings) * 100));
              const publicLink = getPublicLink(job);

              return (
                <div key={job.id} className="card-elevated hover-lift p-6 flex flex-col justify-between border-2 border-border/80 hover:border-primary/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 text-[11px] font-bold text-muted-foreground bg-muted rounded-full border border-border/50 font-mono">
                        {job.slug || job.id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {job.status || 'Active'}
                        </span>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1 text-muted-foreground/60 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                          title="Delete Job Opening"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-foreground mb-1 truncate">{job.title}</h3>
                    <p className="text-xs font-semibold text-primary mb-3">{job.department}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location || 'Remote'}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Users2 className="w-3.5 h-3.5 text-primary" />
                        {jobCandidates.length} Applications
                      </div>
                    </div>

                    {/* OPENINGS & HIRED COUNTER BADGE */}
                    <div className="p-2.5 bg-muted/40 border border-border/60 rounded-xl text-xs flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span>Openings: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{totalOpenings}</strong></span>
                      </div>
                      <span className="font-bold text-xs text-primary">
                        {hiredCount} / {totalOpenings} Hired
                      </span>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-border/60 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Hiring Progress</span>
                      <span className="font-bold text-foreground">{calculatedProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          calculatedProgress >= 100 ? 'bg-emerald-500' : 'bg-primary'
                        }`}
                        style={{ width: `${calculatedProgress}%` }}
                      />
                    </div>

                    {/* PUBLIC APPLICATION ACTION BUTTONS */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => window.open(publicLink, '_blank')}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Application
                      </button>

                      <button
                        onClick={() => setSelectedShareJob(job)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share Link
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate Application Pipeline */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Candidate Application Pipeline</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Stages: Shortlist, Reject, Interview, Hire</p>
            </div>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
              Live Applications ({recruitmentCandidates.length})
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {PIPELINE_STAGES.map((stage) => {
              const stageCandidates = recruitmentCandidates.filter(c => {
                const cStage = c.stage || c.status || 'Applied';
                if (stage === 'Hire' && (cStage === 'Hired' || cStage === 'Hire')) return true;
                return cStage.toLowerCase() === stage.toLowerCase();
              });

              return (
                <div key={stage} className="min-w-[260px] flex-1 bg-muted/20 border border-border/60 rounded-2xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between font-semibold text-sm">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      stage === 'Shortlist' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                      stage === 'Interview' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                      stage === 'Reject' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                      stage === 'Hire' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      'bg-slate-500/10 text-slate-600 border-slate-500/20'
                    }`}>
                      {stage}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-card border border-border text-muted-foreground font-bold">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
                    {stageCandidates.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground/60 border border-dashed border-border/40 rounded-xl">
                        No candidates in {stage}
                      </div>
                    ) : (
                      stageCandidates.map((cand) => {
                        const candName = cand.fullName || cand.name || 'Applicant';
                        const initials = candName ? candName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CA';

                        return (
                          <div
                            key={cand.id}
                            onClick={() => setSelectedCandidate(cand)}
                            className="bg-card border border-border/80 shadow-sm rounded-xl p-3.5 hover:border-primary transition-all space-y-2.5 cursor-pointer group"
                          >
                            <div className="flex gap-3 items-center">
                              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 border border-primary/20">
                                {initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{candName}</div>
                                <div className="text-[11px] text-muted-foreground truncate mt-0.5">{cand.role || cand.jobTitle || 'Applicant'}</div>
                              </div>
                            </div>

                            <div className="text-[11px] text-muted-foreground space-y-1">
                              <div className="truncate">📧 {cand.email}</div>
                              {cand.phone && <div>📞 {cand.phone}</div>}
                            </div>

                            {/* Quick Stage Transition & Delete Buttons */}
                            <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-1 text-[11px]" onClick={e => e.stopPropagation()}>
                              <select
                                value={cand.stage || cand.status || 'Applied'}
                                onChange={(e) => handleMoveStage(cand.id, e.target.value)}
                                className="bg-background border border-border text-foreground rounded-lg px-2 py-1 text-[11px] font-medium focus:outline-none focus:border-primary cursor-pointer flex-1"
                              >
                                {PIPELINE_STAGES.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                title="Delete candidate & clean up resume"
                                onClick={() => handleDeleteCandidate(cand.id, candName)}
                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SHARE PUBLIC APPLICATION LINK MODAL */}
        {selectedShareJob && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setSelectedShareJob(null)}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Share Public Application Link</h2>
                  <p className="text-xs text-muted-foreground">Public link for {selectedShareJob.title}</p>
                </div>
              </div>

              {(() => {
                const publicLink = getPublicLink(selectedShareJob);

                return (
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Public Application Page URL
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={publicLink}
                          className="flex-1 px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono select-all focus:outline-none"
                        />
                        <button
                          onClick={() => handleCopyLink(selectedShareJob)}
                          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                        >
                          {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedLink ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Apply for ${selectedShareJob.title}: ${publicLink}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-500/20 font-bold text-xs transition-all text-center"
                      >
                        <MessageSquare className="w-4 h-4" /> Share via WhatsApp
                      </a>
                      <a
                        href={`mailto:?subject=${encodeURIComponent(`Job Opportunity - ${selectedShareJob.title}`)}&body=${encodeURIComponent(`Apply for ${selectedShareJob.title} here: ${publicLink}`)}`}
                        className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-500/20 font-bold text-xs transition-all text-center"
                      >
                        <Mail className="w-4 h-4" /> Share via Email
                      </a>
                    </div>

                    <div className="pt-2 flex justify-between items-center border-t border-border">
                      <button
                        onClick={() => window.open(publicLink, '_blank')}
                        className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Open Page <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedShareJob(null)}
                        className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* CANDIDATE INSPECTION MODAL */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shrink-0 border border-primary/20">
                  {(selectedCandidate.fullName || selectedCandidate.name || 'CA').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedCandidate.fullName || selectedCandidate.name}</h2>
                  <p className="text-xs text-primary font-semibold">{selectedCandidate.role || selectedCandidate.jobTitle || 'Applicant'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                      Stage: {selectedCandidate.stage || selectedCandidate.status || 'Applied'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Email</span>
                    <div className="text-sm font-medium text-foreground">{selectedCandidate.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Phone</span>
                    <div className="text-sm font-medium text-foreground">{selectedCandidate.phone || 'N/A'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Qualification</span>
                    <div className="text-sm font-medium text-foreground">{selectedCandidate.qualification || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Experience</span>
                    <div className="text-sm font-medium text-foreground">{selectedCandidate.experience || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Skills</span>
                  <div className="p-2.5 bg-muted/30 border border-border/60 rounded-xl text-foreground text-xs font-mono">
                    {selectedCandidate.skills || 'N/A'}
                  </div>
                </div>

                {(selectedCandidate.resumeUrl || selectedCandidate.resumeLink) && (
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Resume</span>
                    <a
                      href={selectedCandidate.resumeUrl || selectedCandidate.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs transition-all mt-0.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Resume
                    </a>
                  </div>
                )}

                <div>
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Pipeline Action</span>
                  <div className="flex items-center gap-2">
                    {PIPELINE_STAGES.map(stg => (
                      <button
                        key={stg}
                        onClick={() => handleMoveStage(selectedCandidate.id, stg)}
                        className={`flex-1 py-2 rounded-xl font-semibold text-[11px] border transition-all cursor-pointer ${
                          (selectedCandidate.stage === stg || selectedCandidate.status === stg)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        {stg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-5 flex items-center justify-between border-t border-border">
                <button
                  type="button"
                  onClick={() => handleDeleteCandidate(selectedCandidate.id, selectedCandidate.fullName || selectedCandidate.name)}
                  className="px-4 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete & Clean Up Resume
                </button>

                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* CREATE JOB MODAL */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-foreground mb-1">Post a New Job Role</h2>
              <p className="text-xs text-muted-foreground mb-4">Creates a Job posting & auto-generates a public application URL (/apply/:slug).</p>

              <form onSubmit={handlePostJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior React Developer"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none h-[40px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <CustomSelect
                      label="Department"
                      options={departmentOptions}
                      value={jobFormData.department}
                      onChange={(val) => setJobFormData({ ...jobFormData, department: val })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Openings *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={jobFormData.totalOpenings}
                      onChange={(e) => setJobFormData({ ...jobFormData, totalOpenings: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none h-[40px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Remote, New York"
                      value={jobFormData.location}
                      onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none h-[40px]"
                    />
                  </div>
                  <div className="z-20">
                    <CustomSelect
                      label="Employment Type"
                      value={jobFormData.employmentType}
                      onChange={(val) => setJobFormData({ ...jobFormData, employmentType: val })}
                      options={[
                        { label: 'Full-time', value: 'Full-time' },
                        { label: 'Part-time', value: 'Part-time' },
                        { label: 'Contract', value: 'Contract' },
                        { label: 'Internship', value: 'Internship' }
                      ]}
                      className="h-[40px] bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Salary Range (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹90,000 - ₹130,000 / year"
                    value={jobFormData.salary}
                    onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Job Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe job responsibilities and company overview..."
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="List required skills and experience..."
                    value={jobFormData.requirements}
                    onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-4 py-2 border border-border text-foreground hover:bg-muted font-medium rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm shadow-md shadow-primary/20 transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Job & Generate Public Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
