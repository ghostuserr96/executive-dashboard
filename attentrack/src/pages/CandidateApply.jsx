import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Upload,
  ShieldCheck,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  AlertCircle,
  Trash2,
  Eye,
  Moon,
  Sun,
  FileCheck,
  Sparkles,
  Check,
  Globe,
  Award,
  ArrowLeft,
  ArrowRight,
  Share2,
  User,
  Mail,
  Phone,
  GraduationCap,
  Link
} from 'lucide-react';
import { recruitmentService } from '../services/recruitmentService';

// Custom Brand SVGs
const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function CandidateApply() {
  const { jobSlug } = useParams();
  const [searchParams] = useSearchParams();

  const activeSlug = jobSlug || searchParams.get('slug') || searchParams.get('jobId') || '';

  // Job Data
  const [job, setJob] = useState(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);

  // Theme & State — Dark Mode default
  const [darkMode, setDarkMode] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // UI Modes: Multi-step wizard vs Full Single Page
  const [viewMode, setViewMode] = useState('wizard'); // 'wizard' | 'full'
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Draft Auto-Save Notification
  const [hasDraftLoaded, setHasDraftLoaded] = useState(false);

  // Resume File State
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileMime, setFileMime] = useState('');
  const [base64File, setBase64File] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Application Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    highestQualification: 'Bachelor Degree',
    experience: '',
    currentLocation: '',
    skills: '',
    portfolio: '',
    linkedin: '',
    github: '',
    coverLetter: ''
  });

  const fileInputRef = useRef(null);

  // Fetch Job details by slug
  useEffect(() => {
    async function loadJob() {
      setIsLoadingJob(true);
      if (!activeSlug) {
        setJob({
          id: 'JR-204',
          title: 'Senior HR Manager',
          slug: 'senior-hr-manager',
          department: 'People Ops',
          location: 'San Francisco, CA (Hybrid)',
          employmentType: 'Full-time',
          salary: '$110,000 - $145,000 / year',
          description: 'We are seeking an experienced Senior HR Manager to oversee talent acquisition, employee experience, and HR operations. You will partner with business leaders to build world-class hiring programs and drive organizational culture.',
          requirements: '• 5+ years of progressive HR or People Ops leadership experience.\n• Demonstrated success scaling recruitment pipelines and implementing modern ATS workflows.\n• Deep knowledge of employment guidelines, candidate experience, and team management.'
        });
        setIsLoadingJob(false);
        return;
      }

      try {
        const res = await recruitmentService.getJobBySlug(activeSlug);
        if (res && res.data) {
          setJob(res.data);
        } else {
          const formattedTitle = activeSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          setJob({
            id: 'JR-101',
            title: formattedTitle,
            slug: activeSlug,
            department: 'Talent Acquisition',
            location: 'Remote',
            employmentType: 'Full-time',
            salary: 'Competitive Salary + Equity',
            description: `We are looking for an exceptional ${formattedTitle} to join our high-growth team. You will drive core initiatives and help shape the future of our product and team culture.`,
            requirements: '• Relevant domain expertise and demonstrated track record.\n• Experience working in fast-paced collaborative environments.\n• Excellent communication and problem-solving skills.'
          });
        }
      } catch (err) {
        const formattedTitle = activeSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setJob({
          id: 'JR-101',
          title: formattedTitle,
          slug: activeSlug,
          department: 'Engineering',
          location: 'Remote',
          employmentType: 'Full-time',
          salary: 'Competitive Salary',
          description: `Join us as a ${formattedTitle}! Submit your application below.`,
          requirements: '• Demonstrated experience in role requirements.'
        });
      } finally {
        setIsLoadingJob(false);
      }
    }

    loadJob();
  }, [activeSlug]);

  // Load Draft from LocalStorage on mount
  useEffect(() => {
    const draftKey = `ats_draft_${activeSlug || 'general'}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        setHasDraftLoaded(true);
        setTimeout(() => setHasDraftLoaded(false), 4000);
      } catch (e) {
        console.warn('Could not parse draft');
      }
    }
  }, [activeSlug]);

  // Auto-Save Draft to LocalStorage on changes
  useEffect(() => {
    if (submitted) return;
    const draftKey = `ats_draft_${activeSlug || 'general'}`;
    const hasData = Object.values(formData).some(val => Boolean(val.trim()));
    if (hasData) {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, activeSlug, submitted]);

  // Handle Resume File Selection & Drag-n-Drop
  const processFile = (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      showError('Invalid file format! Only PDF, DOC, and DOCX files are allowed.');
      return;
    }

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      showError(`File size exceeds limit! Maximum allowed size is ${MAX_MB} MB.`);
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setFileMime(file.type || 'application/pdf');

    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64File(reader.result);
      showToast(`Resume '${file.name}' attached!`);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Step Validation before Next
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.fullName.trim()) return showError('Full Name is required.');
      if (!formData.email.trim()) return showError('Email Address is required.');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) return showError('Please enter a valid email address.');
      if (!formData.phone.trim()) return showError('Phone Number is required.');
      const phoneRegex = /^[+\d\s()-]{7,20}$/;
      if (!phoneRegex.test(formData.phone.trim())) return showError('Please enter a valid phone number (min 7 digits).');
      if (!formData.currentLocation.trim()) return showError('Current Location is required.');
    } else if (step === 2) {
      if (!formData.highestQualification.trim()) return showError('Highest Qualification is required.');
      if (!formData.experience.trim()) return showError('Experience details are required.');
      if (!formData.skills.trim()) return showError('Key Skills are required.');
    } else if (step === 3) {
      if (!base64File) return showError('Resume upload is mandatory. Please attach your PDF, DOC, or DOCX file.');
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setErrorMessage('');
      setCurrentStep(prev => Math.min(totalSteps, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) return showError('Full Name is required.');
    if (!formData.email.trim()) return showError('Email Address is required.');
    if (!formData.phone.trim()) return showError('Phone Number is required.');
    if (!formData.highestQualification.trim()) return showError('Highest Qualification is required.');
    if (!formData.experience.trim()) return showError('Experience details are required.');
    if (!formData.currentLocation.trim()) return showError('Current Location is required.');
    if (!formData.skills.trim()) return showError('Key Skills are required.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) return showError('Please enter a valid email address.');

    const phoneRegex = /^[+\d\s()-]{7,20}$/;
    if (!phoneRegex.test(formData.phone.trim())) return showError('Please enter a valid phone number.');

    if (!base64File) return showError('Resume upload is mandatory. Please attach your PDF, DOC, or DOCX resume.');

    setIsSubmitting(true);

    try {
      const payload = {
        jobId: job?.id,
        slug: activeSlug || job?.slug,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        qualification: formData.highestQualification.trim(),
        experience: formData.experience.trim(),
        location: formData.currentLocation.trim(),
        skills: formData.skills.trim(),
        portfolio: formData.portfolio.trim(),
        linkedin: formData.linkedin.trim(),
        github: formData.github.trim(),
        coverLetter: formData.coverLetter.trim(),
        base64File,
        fileName,
        mimeType: fileMime
      };

      const res = await recruitmentService.submitPublicApplication(payload, activeSlug);

      if (res && res.success) {
        const draftKey = `ats_draft_${activeSlug || 'general'}`;
        localStorage.removeItem(draftKey);
        setSubmitted(true);
      } else {
        showError(res?.message || 'Application submission failed. Please try again.');
      }
    } catch (err) {
      showError(err.message || 'Failed submitting application. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (isLoadingJob) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#090d16] text-foreground' : 'bg-slate-100 text-slate-900'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-purple-500">Loading Job Application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'min-h-screen bg-[#090d16] text-slate-100 font-sans transition-colors duration-300' : 'min-h-screen bg-[#f1f5f9] text-slate-900 font-sans transition-colors duration-300'}>

      {/* TOP BRANDING BAR */}
      <header className={darkMode ? 'sticky top-0 z-40 border-b bg-[#0f172a]/95 border-border backdrop-blur-md' : 'sticky top-0 z-40 border-b bg-background/95 border-slate-200 shadow-xs backdrop-blur-md'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-foreground font-black text-lg shadow-md shadow-purple-600/30">
              AT
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-500">
                <span>AttenTrack Careers</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className={darkMode ? 'text-sm font-extrabold text-foreground' : 'text-sm font-extrabold text-slate-900'}>
                Public Application Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle Pill */}
            <div className={darkMode ? 'hidden sm:flex items-center p-1 rounded-xl border text-xs font-bold bg-background border-border' : 'hidden sm:flex items-center p-1 rounded-xl border text-xs font-bold bg-slate-100 border-slate-200'}>
              <button
                type="button"
                onClick={() => setViewMode('wizard')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'wizard' ? 'bg-purple-600 text-foreground shadow-sm font-black' : darkMode ? 'text-muted-foreground hover:text-foreground' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Wizard Mode
              </button>
              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'full' ? 'bg-purple-600 text-foreground shadow-sm font-black' : darkMode ? 'text-muted-foreground hover:text-foreground' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Single Page
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className={darkMode ? 'p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-card border-border text-secondary-foreground hover:bg-secondary' : 'p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-background border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-purple-500" />}
              <span className="hidden md:inline">{copiedLink ? 'Copied' : 'Share Job'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={darkMode ? 'p-2.5 rounded-xl border transition-all cursor-pointer bg-card border-border text-amber-400 hover:bg-secondary' : 'p-2.5 rounded-xl border transition-all cursor-pointer bg-background border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'}
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
        {errorMessage && (
          <div className="p-4 bg-rose-600 text-foreground rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in pointer-events-auto">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold">{errorMessage}</span>
          </div>
        )}
        {toastMessage && (
          <div className="p-4 bg-emerald-600 text-foreground rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in pointer-events-auto">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}
        {hasDraftLoaded && (
          <div className="p-3 bg-purple-600 text-foreground rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in pointer-events-auto">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Restored saved application draft.</span>
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {submitted ? (
          /* SUBMISSION SUCCESS SCREEN */
          <div className={darkMode ? 'max-w-2xl mx-auto rounded-3xl p-8 md:p-12 shadow-2xl space-y-6 text-center animate-in zoom-in-95 border bg-[#1e293b] border-border text-foreground' : 'max-w-2xl mx-auto rounded-3xl p-8 md:p-12 shadow-md space-y-6 text-center animate-in zoom-in-95 border bg-background border-slate-200 text-slate-900'}>
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Application Submitted!</h2>
              <p className={darkMode ? 'text-sm text-foreground max-w-md mx-auto leading-relaxed' : 'text-sm text-slate-600 max-w-md mx-auto leading-relaxed'}>
                Thank you, <strong className="text-purple-500 font-extrabold">{formData.fullName}</strong>. Your application for <strong>{job?.title}</strong> has been saved directly into our ATS recruitment pipeline. Your resume was uploaded to Google Drive.
              </p>
            </div>

            <div className={darkMode ? 'p-5 bg-background border border-border rounded-2xl text-xs space-y-2 max-w-md mx-auto text-left font-mono text-secondary-foreground' : 'p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 max-w-md mx-auto text-left font-mono text-slate-800'}>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position:</span>
                <span className="font-bold">{job?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Candidate Email:</span>
                <span className="font-bold text-purple-500">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requisition ID:</span>
                <span className="font-bold text-emerald-500">{job?.id || 'APP-OK'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(1);
                setFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  highestQualification: 'Bachelor Degree',
                  experience: '',
                  currentLocation: '',
                  skills: '',
                  portfolio: '',
                  linkedin: '',
                  github: '',
                  coverLetter: ''
                });
                setFileName('');
                setBase64File('');
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-foreground rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Submit Another Application
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT PANEL: STICKY JOB OVERVIEW CARD */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className={darkMode ? 'rounded-3xl overflow-hidden shadow-xl border bg-[#1e293b] border-border/80' : 'rounded-3xl overflow-hidden shadow-md border bg-background border-slate-200'}>
                
                {/* SIGNATURE ACCENT BAR */}
                <div className="h-3 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600" />
                
                <div className="p-6 md:p-7 space-y-5">
                  
                  <div className="flex items-center justify-between">
                    <span className={darkMode ? 'px-3.5 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-black uppercase tracking-wider' : 'px-3.5 py-1.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-xs font-black uppercase tracking-wider'}>
                      {job?.department || 'People Ops'}
                    </span>
                    <span className={darkMode ? 'text-xs font-mono text-muted-foreground font-bold' : 'text-xs font-mono text-muted-foreground font-bold'}>
                      {job?.id || 'JR-204'}
                    </span>
                  </div>

                  <div>
                    {/* JOB TITLE H1 — HIGH CONTRAST */}
                    <h1 className={darkMode ? 'text-2xl md:text-3xl font-black text-foreground tracking-tight leading-snug' : 'text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug'}>
                      {job?.title}
                    </h1>
                    <p className={darkMode ? 'text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-semibold' : 'text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-semibold'}>
                      <Globe className="w-3.5 h-3.5 text-purple-500" /> Direct Public ATS Link
                    </p>
                  </div>

                  {/* METADATA BADGES — CRISP & GUARANTEED HIGH CONTRAST */}
                  <div className="space-y-2.5 text-xs font-bold">
                    <div className={darkMode ? 'flex items-center gap-2.5 bg-secondary/90 border border-border text-slate-100 p-3 rounded-2xl' : 'flex items-center gap-2.5 bg-slate-100 border border-slate-200 text-slate-900 p-3 rounded-2xl'}>
                      <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>{job?.location || 'San Francisco, CA (Hybrid)'}</span>
                    </div>
                    <div className={darkMode ? 'flex items-center gap-2.5 bg-secondary/90 border border-border text-slate-100 p-3 rounded-2xl' : 'flex items-center gap-2.5 bg-slate-100 border border-slate-200 text-slate-900 p-3 rounded-2xl'}>
                      <Briefcase className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>{job?.employmentType || 'Full-time'}</span>
                    </div>
                    {job?.salary && (
                      <div className={darkMode ? 'flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-2xl font-black' : 'flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-2xl font-black'}>
                        <DollarSign className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>

                  {/* JOB OVERVIEW */}
                  <div className={darkMode ? 'pt-4 border-t border-border/80 space-y-3.5 text-xs text-foreground leading-relaxed' : 'pt-4 border-t border-slate-200 space-y-3.5 text-xs text-slate-700 leading-relaxed'}>
                    <div>
                      <h4 className={darkMode ? 'font-black text-foreground uppercase tracking-wider text-[11px] mb-1' : 'font-black text-slate-900 uppercase tracking-wider text-[11px] mb-1'}>
                        About the Role
                      </h4>
                      <p className="line-clamp-5">{job?.description}</p>
                    </div>

                    {job?.requirements && (
                      <div>
                        <h4 className={darkMode ? 'font-black text-foreground uppercase tracking-wider text-[11px] mb-1' : 'font-black text-slate-900 uppercase tracking-wider text-[11px] mb-1'}>
                          Requirements
                        </h4>
                        <div className={darkMode ? 'whitespace-pre-line font-mono bg-background p-3.5 rounded-2xl border border-border text-secondary-foreground max-h-44 overflow-y-auto' : 'whitespace-pre-line font-mono bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-800 max-h-44 overflow-y-auto'}>
                          {job.requirements}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SIDEBAR STEP PROGRESS BAR */}
                  {viewMode === 'wizard' && (
                    <div className={darkMode ? 'pt-4 border-t border-border/80 space-y-2' : 'pt-4 border-t border-slate-200 space-y-2'}>
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className={darkMode ? 'text-muted-foreground uppercase tracking-wider text-[10px]' : 'text-muted-foreground uppercase tracking-wider text-[10px]'}>Progress</span>
                        <span className="text-purple-500 font-mono">{Math.round((currentStep / totalSteps) * 100)}%</span>
                      </div>
                      <div className={darkMode ? 'h-2.5 w-full bg-background rounded-full overflow-hidden border border-border p-0.5' : 'h-2.5 w-full bg-slate-200 rounded-full overflow-hidden p-0.5'}>
                        <div
                          className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* RIGHT PANEL: APPLICATION FORM */}
            <div className="lg:col-span-8 space-y-6">

              {/* STEP TABS NAVIGATION (WIZARD MODE) */}
              {viewMode === 'wizard' && (
                <div className={darkMode ? 'rounded-2xl p-2 flex items-center justify-between text-xs font-bold overflow-x-auto border bg-[#1e293b] border-border' : 'rounded-2xl p-2 flex items-center justify-between text-xs font-bold overflow-x-auto border bg-background border-slate-200 shadow-xs'}>
                  {[
                    { num: 1, label: '1. Contact', icon: <User className="w-3.5 h-3.5" /> },
                    { num: 2, label: '2. Skills', icon: <Award className="w-3.5 h-3.5" /> },
                    { num: 3, label: '3. Resume', icon: <Upload className="w-3.5 h-3.5" /> },
                    { num: 4, label: '4. Review', icon: <CheckCircle2 className="w-3.5 h-3.5" /> }
                  ].map((st) => (
                    <button
                      key={st.num}
                      type="button"
                      onClick={() => {
                        if (st.num < currentStep || validateStep(currentStep)) {
                          setCurrentStep(st.num);
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all cursor-pointer min-w-[100px] ${
                        currentStep === st.num
                          ? 'bg-purple-600 text-foreground shadow-md font-black'
                          : currentStep > st.num
                          ? darkMode ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : darkMode ? 'text-foreground hover:text-foreground' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {currentStep > st.num ? <Check className="w-3.5 h-3.5" /> : st.icon}
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* FORM CARDS CONTAINER */}
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* STEP 1: PERSONAL & CONTACT DETAILS */}
                {(viewMode === 'full' || currentStep === 1) && (
                  <div className={darkMode ? 'rounded-3xl p-6 md:p-8 space-y-5 border shadow-xl bg-[#1e293b] border-border/80' : 'rounded-3xl p-6 md:p-8 space-y-5 border shadow-md bg-background border-slate-200'}>
                    <div className={darkMode ? 'flex items-center justify-between border-b pb-4 border-border' : 'flex items-center justify-between border-b pb-4 border-slate-200'}>
                      <div className={darkMode ? 'flex items-center gap-2 text-sm font-black text-purple-400 uppercase tracking-wider' : 'flex items-center gap-2 text-sm font-black text-purple-700 uppercase tracking-wider'}>
                        <User className="w-4 h-4" /> Personal & Contact Info
                      </div>
                      <span className={darkMode ? 'text-xs text-muted-foreground font-bold' : 'text-xs text-muted-foreground font-bold'}>* Mandatory</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                      {/* FULL NAME */}
                      <div>
                        <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5' : 'block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5'}>
                          <User className="w-3.5 h-3.5 text-purple-500" /> Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Johnson"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className={darkMode ? 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-semibold' : 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-slate-50 border-slate-300 text-slate-900 placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all font-semibold'}
                        />
                      </div>

                      {/* EMAIL ADDRESS */}
                      <div>
                        <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5' : 'block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5'}>
                          <Mail className="w-3.5 h-3.5 text-purple-500" /> Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="alex@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={darkMode ? 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-semibold' : 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-slate-50 border-slate-300 text-slate-900 placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all font-semibold'}
                        />
                      </div>

                      {/* PHONE NUMBER */}
                      <div>
                        <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5' : 'block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5'}>
                          <Phone className="w-3.5 h-3.5 text-purple-500" /> Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+1 (555) 000-1234"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={darkMode ? 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-semibold' : 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-slate-50 border-slate-300 text-slate-900 placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all font-semibold'}
                        />
                      </div>

                      {/* CURRENT LOCATION */}
                      <div>
                        <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5' : 'block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5'}>
                          <MapPin className="w-3.5 h-3.5 text-purple-500" /> Current Location <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="City, Country"
                          value={formData.currentLocation}
                          onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                          className={darkMode ? 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-semibold' : 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-slate-50 border-slate-300 text-slate-900 placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all font-semibold'}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: QUALIFICATIONS & BACKGROUND */}
                {(viewMode === 'full' || currentStep === 2) && (
                  <div className={darkMode ? 'rounded-3xl p-6 md:p-8 space-y-5 border shadow-xl bg-[#1e293b] border-border/80' : 'rounded-3xl p-6 md:p-8 space-y-5 border shadow-md bg-background border-slate-200'}>
                    <div className={darkMode ? 'flex items-center justify-between border-b pb-4 border-border' : 'flex items-center justify-between border-b pb-4 border-slate-200'}>
                      <div className={darkMode ? 'flex items-center gap-2 text-sm font-black text-purple-400 uppercase tracking-wider' : 'flex items-center gap-2 text-sm font-black text-purple-700 uppercase tracking-wider'}>
                        <Award className="w-4 h-4" /> Experience & Skills
                      </div>
                      <span className={darkMode ? 'text-xs text-muted-foreground font-bold' : 'text-xs text-muted-foreground font-bold'}>* Mandatory</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                      {/* HIGHEST QUALIFICATION */}
                      <div>
                        <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5' : 'block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5'}>
                          <GraduationCap className="w-3.5 h-3.5 text-purple-500" /> Qualification <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.highestQualification}
                          onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                          className={darkMode ? 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-background border-border text-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-semibold cursor-pointer' : 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all font-semibold cursor-pointer'}
                        >
                          <option value="High School">High School (12th / SSC)</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Bachelor Degree">Bachelor's Degree (B.Tech / B.E / B.Sc / BCA)</option>
                          <option value="Master Degree">Master's Degree (M.Tech / M.Sc / MCA / MBA)</option>
                          <option value="Doctorate / PhD">Doctorate / PhD</option>
                        </select>
                      </div>

                      {/* TOTAL EXPERIENCE */}
                      <div>
                        <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5' : 'block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5'}>
                          <Briefcase className="w-3.5 h-3.5 text-purple-500" /> Total Experience <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 4 Years or Fresher"
                          value={formData.experience}
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                          className={darkMode ? 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-semibold' : 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-slate-50 border-slate-300 text-slate-900 placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all font-semibold'}
                        />
                      </div>
                    </div>

                    {/* KEY SKILLS */}
                    <div>
                      <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5' : 'block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5'}>
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Key Technical Skills <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. React, Node.js, TypeScript, TailwindCSS, PostgreSQL"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        className={darkMode ? 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-semibold' : 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-slate-50 border-slate-300 text-slate-900 placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all font-semibold'}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: RESUME UPLOAD & PROFILES */}
                {(viewMode === 'full' || currentStep === 3) && (
                  <div className={darkMode ? 'rounded-3xl p-6 md:p-8 space-y-5 border shadow-xl bg-[#1e293b] border-border/80' : 'rounded-3xl p-6 md:p-8 space-y-5 border shadow-md bg-background border-slate-200'}>
                    <div className={darkMode ? 'flex items-center justify-between border-b pb-4 border-border' : 'flex items-center justify-between border-b pb-4 border-slate-200'}>
                      <div className={darkMode ? 'flex items-center gap-2 text-sm font-black text-purple-400 uppercase tracking-wider' : 'flex items-center gap-2 text-sm font-black text-purple-700 uppercase tracking-wider'}>
                        <Upload className="w-4 h-4" /> Resume & Professional Profiles
                      </div>
                      <span className={darkMode ? 'text-xs text-muted-foreground font-bold' : 'text-xs text-muted-foreground font-bold'}>PDF, DOC, DOCX (Max 10MB)</span>
                    </div>

                    {/* DRAG AND DROP BOX */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={darkMode ? 'border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all border-border bg-background hover:border-purple-500' : 'border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all border-slate-300 bg-slate-50 hover:border-purple-600'}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                        className="hidden"
                      />

                      {base64File ? (
                        <div className="space-y-3">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-foreground flex items-center justify-center mx-auto shadow-md">
                            <FileCheck className="w-7 h-7" />
                          </div>
                          <div>
                            <div className={darkMode ? 'text-sm font-black text-foreground' : 'text-sm font-black text-slate-900'}>{fileName}</div>
                            <div className="text-xs text-muted-foreground font-mono mt-0.5">{formatBytes(fileSize)}</div>
                          </div>
                          <div className="flex items-center justify-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(true); }}
                              className={darkMode ? 'px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold hover:bg-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer' : 'px-4 py-2 bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-200 transition-all flex items-center gap-1.5 cursor-pointer'}
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview Resume
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setBase64File(''); setFileName(''); setFileSize(0); }}
                              className={darkMode ? 'px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold hover:bg-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer' : 'px-4 py-2 bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-200 transition-all flex items-center gap-1.5 cursor-pointer'}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className={darkMode ? 'w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto shadow-md' : 'w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto shadow-xs'}>
                            <Upload className="w-7 h-7" />
                          </div>
                          <div className={darkMode ? 'text-sm font-black text-foreground' : 'text-sm font-black text-slate-900'}>
                            Drag & Drop Resume here, or <span className="text-purple-500 underline">Browse File</span>
                          </div>
                          <p className={darkMode ? 'text-xs text-muted-foreground max-w-xs mx-auto' : 'text-xs text-slate-600 max-w-xs mx-auto'}>
                            Uploads directly to HRMS Recruitment folder in Google Drive.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* OPTIONAL PROFILE LINKS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider mb-2 flex items-center gap-1' : 'block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1'}>
                          <Link className="w-3 h-3 text-purple-500" /> Portfolio URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://portfolio.dev"
                          value={formData.portfolio}
                          onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                          className={darkMode ? 'w-full px-3.5 py-3 rounded-2xl text-xs border bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 font-semibold' : 'w-full px-3.5 py-3 rounded-2xl text-xs border bg-slate-50 border-slate-300 text-slate-900 placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 font-semibold'}
                        />
                      </div>

                      <div>
                        <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider mb-2 flex items-center gap-1' : 'block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1'}>
                          <LinkedinIcon className="w-3 h-3 text-purple-500" /> LinkedIn
                        </label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/user"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          className={darkMode ? 'w-full px-3.5 py-3 rounded-2xl text-xs border bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 font-semibold' : 'w-full px-3.5 py-3 rounded-2xl text-xs border bg-slate-50 border-slate-300 text-slate-900 placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 font-semibold'}
                        />
                      </div>

                      <div>
                        <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider mb-2 flex items-center gap-1' : 'block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1'}>
                          <GithubIcon className="w-3 h-3 text-purple-500" /> GitHub
                        </label>
                        <input
                          type="url"
                          placeholder="https://github.com/user"
                          value={formData.github}
                          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                          className={darkMode ? 'w-full px-3.5 py-3 rounded-2xl text-xs border bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 font-semibold' : 'w-full px-3.5 py-3 rounded-2xl text-xs border bg-slate-50 border-slate-300 text-slate-900 placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 font-semibold'}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: COVER LETTER & APPLICATION REVIEW */}
                {(viewMode === 'full' || currentStep === 4) && (
                  <div className={darkMode ? 'rounded-3xl p-6 md:p-8 space-y-5 border shadow-xl bg-[#1e293b] border-border/80' : 'rounded-3xl p-6 md:p-8 space-y-5 border shadow-md bg-background border-slate-200'}>
                    <div className={darkMode ? 'flex items-center justify-between border-b pb-4 border-border' : 'flex items-center justify-between border-b pb-4 border-slate-200'}>
                      <div className={darkMode ? 'flex items-center gap-2 text-sm font-black text-purple-400 uppercase tracking-wider' : 'flex items-center gap-2 text-sm font-black text-purple-700 uppercase tracking-wider'}>
                        <CheckCircle2 className="w-4 h-4" /> Review & Submit
                      </div>
                      <span className={darkMode ? 'text-xs text-muted-foreground font-bold' : 'text-xs text-muted-foreground font-bold'}>Final Step</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={darkMode ? 'block text-xs font-black text-secondary-foreground uppercase tracking-wider' : 'block text-xs font-black text-slate-800 uppercase tracking-wider'}>
                          Cover Letter / Brief Intro (Optional)
                        </label>
                        <span className="text-[11px] font-mono text-purple-500 font-bold">{formData.coverLetter.length} chars</span>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="Share why you are excited about this role and how your experience aligns..."
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        className={darkMode ? 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-all resize-none font-semibold' : 'w-full px-4 py-3.5 rounded-2xl text-sm border bg-slate-50 border-slate-300 text-slate-900 placeholder:text-muted-foreground focus:outline-none focus:border-purple-600 transition-all resize-none font-semibold'}
                      />
                    </div>

                    {/* SUMMARY REVIEW CARD */}
                    <div className={darkMode ? 'p-4 rounded-2xl bg-background border border-border space-y-2 text-xs text-foreground' : 'p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-800'}>
                      <h4 className="font-black text-purple-500 uppercase tracking-wider text-[11px] mb-2">Application Summary Review</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>Applicant: <strong className={darkMode ? 'text-foreground' : 'text-slate-900'}>{formData.fullName || 'Not specified'}</strong></div>
                        <div>Email: <strong className={darkMode ? 'text-foreground' : 'text-slate-900'}>{formData.email || 'Not specified'}</strong></div>
                        <div>Phone: <strong className={darkMode ? 'text-foreground' : 'text-slate-900'}>{formData.phone || 'Not specified'}</strong></div>
                        <div>Qualification: <strong className={darkMode ? 'text-foreground' : 'text-slate-900'}>{formData.highestQualification}</strong></div>
                        <div>Experience: <strong className={darkMode ? 'text-foreground' : 'text-slate-900'}>{formData.experience || 'Not specified'}</strong></div>
                        <div>Resume Attached: <strong className="text-emerald-500 font-bold">{fileName || 'Attached'}</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NAVIGATION ACTION BUTTONS */}
                {viewMode === 'wizard' ? (
                  <div className="flex items-center justify-between pt-2 pb-12">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className={darkMode ? 'px-6 py-3.5 rounded-2xl border font-black text-xs transition-all flex items-center gap-2 cursor-pointer bg-card border-border text-secondary-foreground hover:bg-secondary' : 'px-6 py-3.5 rounded-2xl border font-black text-xs transition-all flex items-center gap-2 cursor-pointer bg-background border-slate-300 text-slate-800 hover:bg-slate-100'}
                      >
                        <ArrowLeft className="w-4 h-4" /> Previous
                      </button>
                    ) : <div />}

                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-foreground font-black rounded-2xl text-xs shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2 cursor-pointer transform hover:scale-[1.02]"
                      >
                        Continue Next <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-foreground font-black rounded-2xl text-sm shadow-xl shadow-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer transform hover:scale-[1.02]"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Application <CheckCircle2 className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  /* FULL PAGE SUBMIT BUTTON */
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-12">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-foreground font-black rounded-2xl text-base shadow-xl shadow-purple-500/30 transition-all transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          Submit Application <CheckCircle2 className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <div className={darkMode ? 'flex items-center gap-2 text-xs text-muted-foreground font-bold' : 'flex items-center gap-2 text-xs text-slate-600 font-bold'}>
                      <ShieldCheck className="w-4 h-4 text-purple-500" />
                      <span>Encrypted SSL • Direct Google Drive Sync</span>
                    </div>
                  </div>
                )}

              </form>

            </div>

          </div>
        )}

      </main>

      {/* RESUME PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={darkMode ? 'w-full max-w-3xl border rounded-3xl p-6 shadow-2xl relative space-y-4 animate-in fade-in bg-[#1e293b] border-border text-foreground' : 'w-full max-w-3xl border rounded-3xl p-6 shadow-2xl relative space-y-4 animate-in fade-in bg-background border-slate-200 text-slate-900'}>
            <div className={darkMode ? 'flex items-center justify-between border-b pb-3 border-border' : 'flex items-center justify-between border-b pb-3 border-slate-200'}>
              <h3 className="font-black text-lg">Resume Preview</h3>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary/80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className={darkMode ? 'p-4 bg-background border border-border rounded-2xl space-y-1.5 text-xs font-mono text-secondary-foreground' : 'p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs font-mono text-slate-800'}>
              <div>File Name: <span className="font-bold text-purple-500">{fileName}</span></div>
              <div>File Size: <span className="font-bold">{formatBytes(fileSize)}</span></div>
              <div>MIME Type: <span className="font-bold text-emerald-500">{fileMime}</span></div>
            </div>

            {fileMime.includes('pdf') && base64File ? (
              <iframe
                src={base64File}
                title="Resume Preview"
                className={darkMode ? 'w-full h-96 rounded-2xl border border-border' : 'w-full h-96 rounded-2xl border border-slate-200'}
              />
            ) : (
              <div className={darkMode ? 'p-8 text-center text-xs text-muted-foreground bg-background rounded-2xl border border-border' : 'p-8 text-center text-xs text-slate-600 bg-slate-50 rounded-2xl border border-slate-200'}>
                Live document preview available for PDF files. (DOC/DOCX files will upload directly to Google Drive).
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-foreground font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
