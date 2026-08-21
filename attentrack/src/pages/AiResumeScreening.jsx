import React, { useState, useEffect, useRef } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import { CustomSelect } from '../components/common/CustomSelect';

const DEFAULT_API_BASE = import.meta.env.VITE_AI_SERVER_URL || "http://127.0.0.1:8001";

// Backend base URL (same env var as apiClient.js uses)
const BACKEND_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.endsWith('/v1') ? envUrl : `${envUrl}/v1`;
  return 'http://localhost:5000/api/v1';
})();

function getApiBaseUrl() {
  const explicitBase = window.localStorage.getItem("talentrank_api_base");
  if (explicitBase) {
    return explicitBase.replace(/\/$/, "");
  }
  return DEFAULT_API_BASE.replace(/\/$/, "");
}

function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export default function AiResumeScreening() {
  const { recruitmentJobs = [], recruitmentCandidates = [] } = useDataContext();
  const [analysisMode, setAnalysisMode] = useState('text');
  const [selectedJobId, setSelectedJobId] = useState("");
  
  // Job Context
  const [jobTitle, setJobTitle] = useState("");
  const [roleFamily, setRoleFamily] = useState("backend");
  const [jobDescription, setJobDescription] = useState("");
  const [mustHave, setMustHave] = useState("");
  const [niceToHave, setNiceToHave] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");

  // Candidates for Text Mode
  const [candidates, setCandidates] = useState([]);

  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewStatus, setPreviewStatus] = useState("");
  const [profilePreviews, setProfilePreviews] = useState([]);
  
  // Results State
  const [statusBanner, setStatusBanner] = useState({ type: '', message: '' });
  const [resultSubtitle, setResultSubtitle] = useState("Awaiting Candidate Evaluation");
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [compareAIdx, setCompareAIdx] = useState(0);
  const [compareBIdx, setCompareBIdx] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [viewMode, setViewMode] = useState('cards');

  const toggleShortlist = (id) => {
    setShortlistedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fileInputRef = useRef(null);

  // File handling
  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  useEffect(() => {
    let ignore = false;

    const fetchPreviews = async () => {
      if (selectedFiles.length > 0) {
        setPreviewStatus("Parsing uploaded resumes...");
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("resumes", file, file.name);
        });

        try {
          const response = await fetch(apiUrl("/preview-files"), {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          if (!ignore) {
            if (!response.ok) {
              throw new Error(data.detail || "Preview parsing failed");
            }
            setProfilePreviews(data.results || []);
            setPreviewStatus("Preview ready. Parsed candidate profiles from uploaded resumes.");
          }
        } catch (error) {
          if (!ignore) {
            setProfilePreviews([]);
            setPreviewStatus(`Preview error: ${error.message || String(error)}`);
          }
        }
      } else {
        setProfilePreviews([]);
        setPreviewStatus("");
      }
    };

    fetchPreviews();

    return () => {
      ignore = true;
    };
  }, [selectedFiles]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Text Candidate Handling
  const updateCandidate = (id, field, value) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCandidate = (id) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const addCandidate = () => {
    setCandidates([...candidates, {
      id: Date.now(),
      name: "",
      years_experience: "",
      resume_text: ""
    }]);
  };

  const splitCommaValues = (value) => {
    if (!value) return [];
    let text = Array.isArray(value) ? value.join('\n') : String(value);
    
    // Insert spacing for concatenated words like Node.jsLangGraph -> Node.js LangGraph
    text = text.replace(/([a-z0-9\.\/])([A-Z])/g, '$1 $2');

    const lines = text.split(/[\n;\r]+/);
    
    const stopWords = new Set([
      '5+', '3+', '1+', '2+', '4+', 'years', 'year', 'yrs', 'yr', 'with', 'or', 'and', 'experience',
      'experienced', 'knowledge', 'familiarity', 'proficient', 'strong', 'exposure', 'bonus', 'plus',
      'optional', 'preferred', 'required', 'must', 'have', 'of', 'in'
    ]);

    const extracted = [];
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      line = line.replace(/^[\d\s\-\.\•\*\>]+\+?/, '').trim();
      const subItems = line.split(/[,/&|\u2022\u2023\u25b6]+|\bAND\b|\bOR\b/i);
      
      for (let item of subItems) {
        let itemClean = item.trim();
        if (!itemClean) continue;
        
        const words = itemClean.split(/\s+/);
        if (words.length >= 2 && !itemClean.includes(',')) {
          for (let w of words) {
            let wClean = w.replace(/^[^\w\+\#\.]+|[^\w\+\#\.]+$/g, '').trim();
            if (wClean && !stopWords.has(wClean.toLowerCase()) && wClean.length >= 2) {
              extracted.push(wClean.toLowerCase());
            }
          }
        } else {
          itemClean = itemClean.replace(/\b(\d*\+?\s*years?|\d*\+?\s*yrs?|with|or|and|experience|experienced|knowledge|familiarity|proficient|strong|exposure|bonus:?|plus:?|optional:?|preferred:?|required:?|must have:?|of|in)\b/gi, '').trim();
          itemClean = itemClean.replace(/^[^\w\+\#\.]+|[^\w\+\#\.]+$/g, '').trim();
          if (itemClean && itemClean.length >= 2) {
            extracted.push(itemClean.toLowerCase());
          }
        }
      }
    }

    return Array.from(new Set(extracted));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusBanner({ type: 'success', message: 'Running analysis...' });
    setIsSubmitting(true);

    try {
      let response;
      if (analysisMode === 'text') {
        if (!candidates.length) throw new Error("Add at least one candidate.");
        if (candidates.some(c => !c.name || !c.resume_text)) {
          throw new Error("Please provide complete data for all text candidates.");
        }

        const payload = {
          job_title: jobTitle,
          role_family: roleFamily,
          job_description: jobDescription,
          must_have_skills: splitCommaValues(mustHave),
          nice_to_have_skills: splitCommaValues(niceToHave),
          target_keywords: splitCommaValues(targetKeywords),
          candidates: candidates.map(c => ({
            name: c.name.trim(),
            years_experience: Number(c.years_experience || 0),
            resume_text: c.resume_text.trim()
          })),
        };

        response = await fetch(apiUrl("/analyze"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        if (!selectedFiles.length) throw new Error("Upload at least one resume file.");
        
        const formData = new FormData();
        formData.append("job_title", jobTitle);
        formData.append("role_family", roleFamily);
        formData.append("job_description", jobDescription);
        formData.append("must_have_skills", mustHave);
        formData.append("nice_to_have_skills", niceToHave);
        formData.append("target_keywords", targetKeywords);

        selectedFiles.forEach((file) => {
          formData.append("resumes", file, file.name);
        });

        response = await fetch(apiUrl("/analyze-files"), {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis request failed");
      }

      setResultSubtitle(`${data.job_title} | Role Profile: ${data.role_family}`);
      setRankedCandidates(data.ranked_candidates || []);
      
      if (data.ranked_candidates?.length > 1) {
        setCompareAIdx(0);
        setCompareBIdx(1);
      } else if (data.ranked_candidates?.length === 1) {
        setCompareAIdx(0);
        setCompareBIdx(0);
      }

      setStatusBanner({ type: 'success', message: 'Analysis complete. Leaderboard refreshed.' });
    } catch (error) {
      let msg = error.message || String(error);
      if (msg.toLowerCase().includes("failed to fetch")) {
        msg = "Error: Failed to reach API. Make sure the backend is running locally on port 8001.";
      }
      setStatusBanner({ type: 'error', message: `Error: ${msg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderScoreBar = (label, value) => {
    const safe = Math.max(0, Math.min(100, value || 0));
    return (
      <div className="flex items-center gap-4 text-sm mb-3">
        <span className="w-32 truncate text-muted-foreground font-medium tracking-tight">{label}</span>
        <div className="flex-1 h-1.5 rounded-full bg-accent overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${safe}%` }}></div>
        </div>
        <strong className="w-12 text-right text-foreground/90 font-bold">{safe.toFixed(1)}</strong>
      </div>
    );
  };

  const getCompareCandidate = (idx) => rankedCandidates[idx] || null;

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background">
      <div className="mx-auto max-w-5xl p-6 lg:p-10 space-y-10 animate-fade-in">
        
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-2">Recruitment</div>
          <h1 className="text-3xl font-bold tracking-tight text-card-foreground">Candidate Screening & Evaluation</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Automated candidate compatibility assessment and skill alignment report.
          </p>
        </div>

        <div className="space-y-10">
          
          <div className="bg-card p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/60">
            <h2 className="text-lg font-bold text-card-foreground mb-6 pb-4 border-b border-border/60">Job Context & Upload</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                <label className="block text-[10px] font-bold text-primary mb-3 uppercase tracking-widest">Auto-fill from Internal Jobs</label>
                <CustomSelect 
                  options={[
                    { value: '', label: '-- Select an active job post --' },
                    ...recruitmentJobs.map(job => ({ value: job.id, label: `${job.title} (${job.department})` }))
                  ]}
                  value={selectedJobId}
                  onChange={async (val) => {
                    setSelectedJobId(val);
                    const job = recruitmentJobs.find(j => String(j.id) === String(val));
                    if (job) {
                      setJobTitle(job.title);
                      setJobDescription(job.description || '');
                      setMustHave(job.requirements || '');
                      
                      const applied = recruitmentCandidates.filter(c => String(c.jobId) === String(job.id));
                      if (applied.length > 0) {
                        // Always switch to Upload Files mode — fetch resumes from Cloudinary via direct URL
                        setAnalysisMode('files');
                        setPreviewStatus('Fetching resumes from cloud...');
                        const fileObjs = [];
                        
                        for (const c of applied) {
                          try {
                            if (c.base64File) {
                              // In-memory base64 (rare case)
                              const res = await fetch(c.base64File);
                              const blob = await res.blob();
                              const file = new File([blob], `${(c.fullName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`, { 
                                type: c.mimeType || blob.type || 'application/pdf' 
                              });
                              fileObjs.push(file);
                            } else if (c.resumeLink) {
                              // Fetch PDF directly from Cloudinary (public URL)
                              const response = await fetch(c.resumeLink);
                              if (response.ok) {
                                const blob = await response.blob();
                                const isDataUrl = c.resumeLink.startsWith('data:');
                                const nameParts = isDataUrl ? null : c.resumeLink.split('/').pop();
                                const file = new File([blob], nameParts || `${(c.fullName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`, { 
                                  type: blob.type || 'application/pdf' 
                                });
                                fileObjs.push(file);
                              }
                            }
                          } catch (err) {
                            console.error('Failed to fetch resume:', err);
                          }
                        }
                        
                        setSelectedFiles(fileObjs);
                        setPreviewStatus('');
                      } else {
                        setCandidates([]);
                        setSelectedFiles([]);
                      }
                    }
                  }}
                  placeholder="-- Select an active job post --"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-foreground/90 mb-2 uppercase tracking-wide">Job Title</label>
                  <input required value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Frontend Developer" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-card-foreground text-sm focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all font-medium" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground/90 mb-2 uppercase tracking-wide">Role Family</label>
                  <CustomSelect 
                    options={[
                      { value: "backend", label: "Backend" },
                      { value: "frontend", label: "Frontend" },
                      { value: "data_ai", label: "Data/AI" },
                      { value: "devops", label: "DevOps" },
                      { value: "fullstack", label: "Fullstack" }
                    ]}
                    value={roleFamily}
                    onChange={setRoleFamily}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/90 mb-2 uppercase tracking-wide">Job Description</label>
                <textarea rows="4" required value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste job description..." className="w-full px-4 py-3 bg-background border border-border rounded-xl text-card-foreground text-sm focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none resize-none transition-all font-medium"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-foreground/90 mb-2 uppercase tracking-wide">Must-Have Skills</label>
                  <input value={mustHave} onChange={e => setMustHave(e.target.value)} placeholder="react, tailwind" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-card-foreground text-sm focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/90 mb-2 uppercase tracking-wide">Nice-To-Have Skills</label>
                  <input value={niceToHave} onChange={e => setNiceToHave(e.target.value)} placeholder="figma, nodejs" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-card-foreground text-sm focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/90 mb-2 uppercase tracking-wide">Target Keywords (Elite Institutions, FAANG, Certifications)</label>
                <input value={targetKeywords} onChange={e => setTargetKeywords(e.target.value)} placeholder="IIT, Google, AWS Certified" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-card-foreground text-sm focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all font-medium" />
              </div>

              <div className="pt-4">
                <div className="flex gap-2 p-1.5 bg-accent rounded-xl w-max mb-6">
                  <button type="button" onClick={() => setAnalysisMode('text')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${analysisMode === 'text' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground/90'}`}>
                    Paste Text
                  </button>
                  <button type="button" onClick={() => setAnalysisMode('files')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${analysisMode === 'files' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground/90'}`}>
                    Upload Files
                  </button>
                </div>

                {analysisMode === 'text' && (
                  <div className="space-y-4">
                    {candidates.map(candidate => (
                      candidate.isAutoLoaded ? (
                        <div key={candidate.id} className="p-5 bg-card border border-border/60 rounded-2xl shadow-sm transition-all hover:shadow-md relative group">
                          <button type="button" onClick={() => removeCandidate(candidate.id)} className="absolute top-4 right-4 p-2 text-muted-foreground/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <h4 className="text-base font-bold text-card-foreground mb-1">{candidate.name}</h4>
                          <p className="text-xs text-muted-foreground font-medium mb-4 flex items-center gap-2">
                            <span className="truncate max-w-[250px]">{candidate.raw_filename}</span> 
                            <span className="text-muted-foreground/50">|</span> 
                            <span>{candidate.years_experience || '0'}</span>
                          </p>
                          {candidate.raw_skills && (
                            <div className="flex flex-wrap gap-1.5 mb-1 pr-10">
                              {splitCommaValues(candidate.raw_skills).map((s, j) => (
                                <span key={j} className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-bold uppercase tracking-wider">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div key={candidate.id} className="p-4 bg-background border border-border rounded-2xl space-y-4 relative group">
                          <button type="button" onClick={() => removeCandidate(candidate.id)} className="absolute top-3 right-3 p-2 text-muted-foreground/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-[1fr_120px] gap-4 pr-10">
                            <input placeholder="Candidate Name" required value={candidate.name} onChange={e => updateCandidate(candidate.id, 'name', e.target.value)} className="w-full px-4 py-2 bg-card border border-border rounded-xl text-card-foreground text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none font-medium" />
                            <input type="number" min="0" step="0.5" placeholder="Years" required value={candidate.years_experience} onChange={e => updateCandidate(candidate.id, 'years_experience', e.target.value)} className="w-full px-4 py-2 bg-card border border-border rounded-xl text-card-foreground text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none font-medium" />
                          </div>
                          <textarea rows="3" placeholder="Paste resume text..." required value={candidate.resume_text} onChange={e => updateCandidate(candidate.id, 'resume_text', e.target.value)} className="w-full px-4 py-3 bg-card border border-border rounded-xl text-card-foreground text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none resize-none font-medium"></textarea>
                        </div>
                      )
                    ))}
                    
                    <button type="button" onClick={addCandidate} className="w-full py-4 border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:bg-primary/5">
                      <Plus className="w-4 h-4" /> Add Candidate
                    </button>
                  </div>
                )}

                {analysisMode === 'files' && (
                  <div className="space-y-4">
                    <input className="hidden" type="file" accept=".pdf,.docx,.txt" multiple ref={fileInputRef} onChange={handleFileChange} />
                    
                    <div 
                      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-indigo-500 bg-primary/10' : 'border-border bg-background hover:border-indigo-400 hover:bg-primary/10/30'}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground/70'}`} />
                      <p className="font-bold text-card-foreground text-base">Drop resume files here or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">Supports PDF, DOCX, TXT. Details are auto-extracted.</p>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="p-4 bg-background rounded-2xl border border-border">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm font-bold text-card-foreground">{selectedFiles.length} file(s) selected</p>
                          <button type="button" onClick={() => setSelectedFiles([])} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Clear All</button>
                        </div>
                        <ul className="text-sm text-foreground/80 font-medium space-y-2">
                          {selectedFiles.map((f, i) => (
                            <li key={i} className="flex items-center justify-between bg-card px-3 py-2 rounded-lg border border-border/60 shadow-sm">
                              <span className="truncate pr-4">{f.name}</span>
                              <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground/70 hover:text-red-500 transition-colors p-1" title="Remove file">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {previewStatus && (
                      <div className="p-4 bg-background text-foreground/90 border border-border rounded-xl text-sm font-medium">
                        {previewStatus}
                      </div>
                    )}
                    
                    {profilePreviews.length > 0 && (
                      <div className="grid gap-3">
                        {profilePreviews.map((preview, i) => {
                          if (preview.status === "error") {
                            return (
                              <div key={i} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <h4 className="text-sm font-bold text-red-500">{preview.filename}</h4>
                                <p className="text-xs text-red-500 mt-1 font-medium">{preview.error || "Parse failed."}</p>
                              </div>
                            );
                          }
                          const skills = preview.detected_skills || [];
                          return (
                            <div key={i} className="p-5 bg-card border border-border/60 rounded-2xl shadow-sm transition-all hover:shadow-md">
                              <h4 className="text-base font-bold text-card-foreground mb-1">{preview.candidate_name || preview.filename}</h4>
                              <p className="text-xs text-muted-foreground font-medium mb-4 flex items-center gap-2">
                                <span className="truncate max-w-[250px]">{preview.filename}</span> 
                                <span className="text-muted-foreground/50">|</span> 
                                <span>{preview.years_experience ?? 0} years detected</span>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {skills.length ? skills.map((s, j) => (
                                  <span key={j} className="px-3 py-1 bg-accent text-foreground/90 rounded-lg text-[11px] font-bold tracking-wide uppercase">
                                    {s}
                                  </span>
                                )) : <span className="text-xs text-muted-foreground/70 italic">No keywords detected</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-border/60 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center bg-primary text-white hover:bg-primary/90 disabled:opacity-50 h-12 px-8 rounded-xl font-bold transition-all gap-2 text-sm w-full md:w-auto">
                  {isSubmitting ? 'Running Analysis...' : 'Run AI Screening'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-card p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/60 min-h-[400px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/60 pb-6 mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-black text-card-foreground tracking-tight">Candidate Ranking Report</h2>
                <p className="text-xs text-muted-foreground font-medium mt-1">Objective suitability evaluation based on job specifications and skill alignment</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-accent/60 p-1 rounded-xl border border-border/50">
                  <button 
                    type="button" 
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Cards View
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Table View
                  </button>
                </div>
                <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest bg-accent px-3 py-1.5 rounded-xl border border-border/40 hidden md:inline-block">{resultSubtitle}</span>
              </div>
            </div>

            {statusBanner.message && (
              <div className={`p-4 rounded-2xl border mb-8 text-sm font-bold ${statusBanner.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                {statusBanner.message}
              </div>
            )}

            {rankedCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-border rounded-3xl bg-background/50">
                <p className="text-base font-bold text-card-foreground mb-1">No candidates analyzed yet</p>
                <p className="text-sm text-muted-foreground font-medium">Configure job context and upload resumes above to generate ranking.</p>
              </div>
            ) : (
              <div>
                {/* Executive KPI Summary Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Screened Candidates</span>
                    <span className="text-2xl font-black text-foreground mt-1">{rankedCandidates.length}</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Top Match Score</span>
                    <span className="text-2xl font-black text-primary mt-1">
                      {(rankedCandidates[0]?.total_score || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Strong Fits (≥75%)</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {rankedCandidates.filter(c => (c.total_score || 0) >= 75).length}
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Avg Compatibility</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      {(rankedCandidates.reduce((a, b) => a + (b.total_score || 0), 0) / rankedCandidates.length).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {viewMode === 'table' ? (
                  <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-accent/50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="p-4">Rank</th>
                          <th className="p-4">Candidate Name</th>
                          <th className="p-4">Experience</th>
                          <th className="p-4">Match Score</th>
                          <th className="p-4">Verified Core Skills</th>
                          <th className="p-4">Skill Gaps / Missing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {rankedCandidates.map((candidate, index) => {
                          const uniqueMatched = Array.from(new Set((candidate.matched_skills || []).map(s => String(s).trim().toUpperCase()))).filter(Boolean);
                          const uniqueMissing = Array.from(new Set((candidate.missing_skills || []).map(s => String(s).trim().toUpperCase()))).filter(Boolean);
                          const totalScore = Math.max(0, Math.min(100, candidate.total_score || 0));

                          return (
                            <tr key={index} className="hover:bg-accent/20 transition-colors font-medium">
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'}`}>
                                  #{index + 1}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-sm text-card-foreground">
                                {candidate.name}
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {candidate.years_experience ? `${candidate.years_experience} Yrs` : 'N/A'}
                              </td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-xl font-bold ${totalScore >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : totalScore >= 65 ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-500/10 text-slate-700 dark:text-slate-300'}`}>
                                  {totalScore.toFixed(1)}%
                                </span>
                              </td>
                              <td className="p-4 max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                  {uniqueMatched.slice(0, 4).map((s, j) => (
                                    <span key={j} className="px-2 py-0.5 bg-accent text-foreground rounded text-[10px] uppercase font-semibold">{s}</span>
                                  ))}
                                  {uniqueMatched.length > 4 && <span className="text-[10px] text-muted-foreground">+{uniqueMatched.length - 4} more</span>}
                                </div>
                              </td>
                              <td className="p-4 max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                  {uniqueMissing.length ? uniqueMissing.slice(0, 3).map((s, j) => (
                                    <span key={j} className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-[10px] uppercase font-semibold">{s}</span>
                                  )) : <span className="text-emerald-600 dark:text-emerald-400 font-semibold">None missing</span>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-6">
                  {rankedCandidates.map((candidate, index) => {
                    const passed = candidate.hard_constraint_passed;
                    const missingCount = candidate.missing_skills?.length || 0;
                    const hasMustHaveReq = Boolean(mustHave?.trim());
                    const isShortlisted = shortlistedIds.has(candidate.id || index);

                    const uniqueMatched = Array.from(new Set((candidate.matched_skills || []).map(s => String(s).trim().toUpperCase()))).filter(Boolean);
                    const uniqueTarget = Array.from(new Set((candidate.matched_target_keywords || []).map(s => String(s).trim().toUpperCase()))).filter(Boolean);
                    const uniqueMissing = Array.from(new Set((candidate.missing_skills || []).map(s => String(s).trim().toUpperCase()))).filter(Boolean);

                    const totalScore = Math.max(0, Math.min(100, candidate.total_score || 0));

                    return (
                      <div key={index} className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
                        
                        {/* Top Header Row */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-border/60">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest shadow-sm ${
                              index === 0 ? 'bg-emerald-600 text-white' : 
                              index === 1 ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : 
                              index === 2 ? 'bg-indigo-600 text-white' : 
                              'bg-slate-800 text-slate-100'
                            }`}>
                              RANK #{index + 1}
                            </span>
                            <h3 className="text-2xl font-black text-card-foreground tracking-tight">
                              {candidate.name}
                            </h3>
                            {candidate.years_experience > 0 && (
                              <span className="px-3 py-1 rounded-md text-xs font-bold bg-accent text-foreground/80 border border-border/60">
                                {candidate.years_experience} Yrs Exp
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 self-end md:self-auto">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider shadow-sm ${
                              totalScore >= 80 ? 'bg-emerald-600 text-white' : 
                              totalScore >= 65 ? 'bg-indigo-600 text-white' : 
                              'bg-slate-800 text-white'
                            }`}>
                              {totalScore.toFixed(1)}% MATCH
                            </span>
                          </div>
                        </div>

                        {/* Executive AI Insights */}
                        <div className="mt-5 p-4 rounded-xl bg-accent/30 border border-border/60 text-xs space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Executive Summary & Candidate Insights</div>
                          {candidate.evidence?.summary && (
                            <p className="text-sm font-semibold text-foreground/90 leading-snug">{candidate.evidence.summary}</p>
                          )}
                          {candidate.evidence?.strengths?.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                              {candidate.evidence.strengths.map((str, sIdx) => (
                                <div key={sIdx} className="flex items-start gap-2 text-muted-foreground font-medium">
                                  <span className="text-emerald-500 font-bold text-sm shrink-0 leading-none">•</span>
                                  <span>{str}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Score Bar Breakdown Grid */}
                        <div className="mt-5 p-4 rounded-xl bg-background/50 border border-border/50 max-w-3xl">
                          {renderScoreBar("Total Match Score", candidate.total_score)}
                          {renderScoreBar("Required Skill Alignment", candidate.skill_score)}
                          {Boolean(mustHave?.trim()) && renderScoreBar("Must-Have Match Rate", candidate.must_have_match_rate)}
                          {Boolean(niceToHave?.trim()) && renderScoreBar("Nice-To-Have Match Rate", candidate.nice_to_have_match_rate)}
                          {Boolean(targetKeywords?.trim()) && renderScoreBar("Target Domain Keywords", candidate.target_keyword_match_rate)}
                          {renderScoreBar("Experience Alignment", candidate.experience_score)}
                        </div>

                        {/* Skills Inventory Breakdown */}
                        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-border/60 text-xs">
                          <div>
                            <span className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-2.5">Verified Core Skills</span>
                            <div className="flex flex-wrap gap-1.5">
                              {uniqueMatched.length ? uniqueMatched.map((s, j) => (
                                <span key={j} className="px-2.5 py-1 bg-accent text-foreground/90 rounded-md text-[11px] font-semibold tracking-wide uppercase border border-border/50">{s}</span>
                              )) : <span className="text-muted-foreground italic">None detected</span>}
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-2.5">Target Keywords Found</span>
                            <div className="flex flex-wrap gap-1.5">
                              {uniqueTarget.length ? uniqueTarget.map((s, j) => (
                                <span key={j} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md text-[11px] font-semibold tracking-wide uppercase">{s}</span>
                              )) : <span className="text-muted-foreground italic">None detected</span>}
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-2.5">Skill Gaps / Missing</span>
                            <div className="flex flex-wrap gap-1.5">
                              {uniqueMissing.length ? uniqueMissing.map((s, j) => (
                                <span key={j} className="px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-[11px] font-semibold tracking-wide uppercase">{s}</span>
                              )) : <span className="text-muted-foreground italic">None missing</span>}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

          {rankedCandidates.length >= 2 && (
            <div className="bg-card p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-6 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">Candidate Comparison</h2>
                </div>
                
                <div className="flex items-center gap-4">
                  <CustomSelect 
                    options={rankedCandidates.map((c, idx) => ({ value: idx, label: c.name }))}
                    value={compareAIdx}
                    onChange={(val) => setCompareAIdx(Number(val))}
                  />
                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">vs</span>
                  <CustomSelect 
                    options={rankedCandidates.map((c, idx) => ({ value: idx, label: c.name }))}
                    value={compareBIdx}
                    onChange={(val) => setCompareBIdx(Number(val))}
                  />
                </div>
              </div>

              {(() => {
                const candA = getCompareCandidate(compareAIdx);
                const candB = getCompareCandidate(compareBIdx);
                if (!candA || !candB) return null;

                const clampScore = (score) => Math.min(100, Math.max(0, score || 0));

                const getDiff = (valA, valB) => {
                  const diff = clampScore(valA) - clampScore(valB);
                  if (diff > 0) return <span className="text-xs font-bold text-primary ml-3">(+{diff.toFixed(1)})</span>;
                  if (diff < 0) return <span className="text-xs font-bold text-orange-500 ml-3">({diff.toFixed(1)})</span>;
                  return <span className="text-xs font-bold text-muted-foreground/70 ml-3">(-)</span>;
                };

                const matchedA = candA.matched_skills || [];
                const matchedB = candB.matched_skills || [];
                const sharedSkills = matchedA.filter(s => matchedB.includes(s));
                const uniqueA = matchedA.filter(s => !matchedB.includes(s));
                const uniqueB = matchedB.filter(s => !matchedA.includes(s));

                const strengthsA = candA.evidence?.strengths || candA.strengths || [];
                const strengthsB = candB.evidence?.strengths || candB.strengths || [];

                const renderMetric = (label, scoreA, scoreB) => (
                  <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                    <div className="flex items-center text-sm font-bold text-card-foreground">
                      {clampScore(scoreA).toFixed(1)}
                      {getDiff(scoreA, scoreB)}
                    </div>
                  </div>
                );

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Candidate A Card */}
                    <div className="p-8 bg-background border border-border/60 rounded-3xl">
                      <h4 className="text-xl font-bold text-card-foreground mb-6">{candA.name}</h4>
                      
                      <div className="mb-8">
                        {renderMetric("Total Score", candA.total_score, candB.total_score)}
                        {renderMetric("Experience", candA.experience_score, candB.experience_score)}
                        {renderMetric("Skill Match", candA.skill_score, candB.skill_score)}
                        {renderMetric("Target Match", candA.target_keyword_match_rate, candB.target_keyword_match_rate)}
                      </div>

                      <div className="space-y-8">
                        <div>
                          <h5 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">Unique Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {uniqueA.length > 0 ? uniqueA.map((s, i) => (
                              <span key={i} className="px-3 py-1.5 bg-card border border-border text-foreground/90 rounded-lg text-[11px] font-bold tracking-wide uppercase shadow-sm">{s}</span>
                            )) : <span className="text-xs text-muted-foreground/70 font-medium italic">None</span>}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">Key Strengths</h5>
                          <ul className="list-disc pl-4 space-y-2">
                            {strengthsA.length > 0 ? strengthsA.map((s, i) => (
                              <li key={i} className="text-sm font-medium text-foreground/90">{s}</li>
                            )) : <li className="text-sm text-muted-foreground/70 font-medium italic">None identified</li>}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Candidate B Card */}
                    <div className="p-8 bg-background border border-border/60 rounded-3xl">
                      <h4 className="text-xl font-bold text-card-foreground mb-6">{candB.name}</h4>
                      
                      <div className="mb-8">
                        {renderMetric("Total Score", candB.total_score, candA.total_score)}
                        {renderMetric("Experience", candB.experience_score, candA.experience_score)}
                        {renderMetric("Skill Match", candB.skill_score, candA.skill_score)}
                        {renderMetric("Target Match", candB.target_keyword_match_rate, candA.target_keyword_match_rate)}
                      </div>

                      <div className="space-y-8">
                        <div>
                          <h5 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">Unique Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {uniqueB.length > 0 ? uniqueB.map((s, i) => (
                              <span key={i} className="px-3 py-1.5 bg-card border border-border text-foreground/90 rounded-lg text-[11px] font-bold tracking-wide uppercase shadow-sm">{s}</span>
                            )) : <span className="text-xs text-muted-foreground/70 font-medium italic">None</span>}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">Key Strengths</h5>
                          <ul className="list-disc pl-4 space-y-2">
                            {strengthsB.length > 0 ? strengthsB.map((s, i) => (
                              <li key={i} className="text-sm font-medium text-foreground/90">{s}</li>
                            )) : <li className="text-sm text-muted-foreground/70 font-medium italic">None identified</li>}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Shared Skills */}
                    <div className="lg:col-span-2 p-6 bg-card border border-border rounded-2xl shadow-sm mt-4">
                      <h5 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-4 text-center">Shared Skills</h5>
                      <div className="flex flex-wrap justify-center gap-2">
                        {sharedSkills.length > 0 ? sharedSkills.map((s, i) => (
                          <span key={i} className="px-3 py-1.5 bg-accent text-foreground/90 rounded-lg text-[11px] font-bold tracking-wide uppercase">{s}</span>
                        )) : <span className="text-xs text-muted-foreground/70 font-medium italic">No shared skills</span>}
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
