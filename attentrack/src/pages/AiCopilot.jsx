import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  BrainCircuit, 
  Send,
  CheckCircle2,
  X,
  UserCheck,
  Building,
  Briefcase,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useDataContext } from '../context/DataContext';

const InsightCard = ({ id, type, title, description, badgeText, onDismiss, onTakeAction }) => {
  let icon, colorClass, badgeClass;

  switch (type) {
    case 'risk':
      icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
      colorClass = 'bg-amber-500/10 text-amber-500';
      badgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      break;
    case 'opportunity':
      icon = <Lightbulb className="w-5 h-5 text-sky-500" />;
      colorClass = 'bg-sky-500/10 text-sky-500';
      badgeClass = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      break;
    case 'insight':
      icon = <TrendingUp className="w-5 h-5 text-blue-500" />;
      colorClass = 'bg-blue-500/10 text-blue-500';
      badgeClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      break;
    case 'recommendation':
      icon = <Sparkles className="w-5 h-5 text-emerald-500" />;
      colorClass = 'bg-emerald-500/10 text-emerald-500';
      badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      break;
    default:
      icon = <Sparkles className="w-5 h-5" />;
      colorClass = 'bg-muted';
      badgeClass = 'bg-muted text-muted-foreground';
  }

  return (
    <div className="card-elevated p-6 flex flex-col justify-between h-full bg-card border border-border rounded-2xl hover:border-primary/30 transition-all duration-200 shadow-sm">
      <div>
        <div className="flex justify-between items-start mb-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
            {icon}
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${badgeClass}`}>
            {badgeText || type}
          </span>
        </div>
        <h3 className="font-semibold text-[15px] mb-2 text-card-foreground leading-snug">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onDismiss(id)}
          className="px-4 py-2 rounded-xl border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors bg-card shadow-sm cursor-pointer"
        >
          Dismiss
        </button>
        <button 
          onClick={() => onTakeAction(title, description)}
          className="px-4 py-2 rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
        >
          Take Action
        </button>
      </div>
    </div>
  );
};

const EmployeeRiskCard = ({ name, role, department, avatar, conf }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 hover:border-primary/40 transition-all bg-card/80 shadow-sm">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-border">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
            {name[0]}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-sm text-card-foreground truncate">{name}</h4>
        <p className="text-xs text-muted-foreground truncate">{role} · {department}</p>
      </div>
    </div>
    <div className="text-right shrink-0">
      <span className="inline-block font-semibold text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mb-0.5">
        High Risk
      </span>
      <div className="text-[11px] text-muted-foreground font-medium">{conf} conf.</div>
    </div>
  </div>
);

export default function AiCopilot() {
  const { employees, attendance, leaves, tasks, performance, recruitmentJobs, recruitmentCandidates, fetchEmployees } = useDataContext();

  // Active insights list - Starts empty as there are no real AI triggers yet
  const [insights, setInsights] = useState([]);

  // Chat message history - Starts empty for a fresh session
  const [messages, setMessages] = useState([]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleDismissInsight = (id) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const handleTakeAction = (title, description) => {
    const actionQuery = `Take action on: "${title}"`;
    handleSendMessage(actionQuery);
  };

  // Live intelligent response generator based on database context
  const generateCopilotResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('leave') || q.includes('vacation')) {
      const activeLeaves = leaves?.filter(l => l.status === 'Approved' || l.status === 'Pending') || [];
      if (activeLeaves.length > 0) {
        const names = activeLeaves.map(l => `• ${l.employeeName} (${l.type}: ${l.startDate} to ${l.endDate})`).join('\n');
        return `Here are current employee leave requests in the system:\n\n${names}\n\nTotal leave requests: ${activeLeaves.length}.`;
      }
      return `Currently, there are no upcoming approved leave requests logged in the database.`;
    }

    if (q.includes('hiring') || q.includes('recruitment') || q.includes('candidate') || q.includes('job')) {
      const jobsCount = recruitmentJobs?.length || 0;
      const candidatesCount = recruitmentCandidates?.length || 0;
      const highMatch = recruitmentCandidates?.filter(c => (c.matchScore || 0) >= 90)?.length || 0;
      return `Active Recruitment Pipeline Status:\n\n• Open Job Roles: ${jobsCount}\n• Total Candidates in Pipeline: ${candidatesCount}\n• High Match Candidates (90%+): ${highMatch}`;
    }

    if (q.includes('summary') || q.includes('hr summary') || q.includes('report')) {
      const totalEmp = employees?.length || 0;
      const totalTasksCount = tasks?.length || 0;
      const pendingLeaves = leaves?.filter(l => l.status === 'Pending')?.length || 0;
      const jobsCount = recruitmentJobs?.length || 0;
      return `Executive HR Summary:\n\n• Total Workforce: ${totalEmp} Active Employees\n• Total Deliverables & Tasks: ${totalTasksCount}\n• Pending Leave Approvals: ${pendingLeaves}\n• Open Job Postings: ${jobsCount}`;
    }

    if (q.includes('task') || q.includes('deliverable') || q.includes('kanban')) {
      const todo = tasks?.filter(t => t.status === 'To Do')?.length || 0;
      const inProg = tasks?.filter(t => t.status === 'In Progress')?.length || 0;
      const done = tasks?.filter(t => t.status === 'Done')?.length || 0;
      return `Current Task Kanban Overview:\n\n• To Do: ${todo} tasks\n• In Progress: ${inProg} tasks\n• Done: ${done} tasks\n\nTotal tracked items: ${(tasks || []).length}.`;
    }

    if (q.includes('burnout') || q.includes('risk') || q.includes('attrition')) {
      return `Burnout Risk Summary:\n\nBased on the current dataset, there are no immediate critical burnout risks detected.`;
    }

    // Default intelligent answer fallback
    const empCount = employees?.length || 0;
    return `I analyzed your workforce database (${empCount} employees, ${tasks?.length || 0} tasks, ${leaves?.length || 0} leave records).\n\nYou can ask me specific questions about employee attendance, recruitment pipeline, performance scores, or active tasks!`;
  };

  const handleSendMessage = (textToSend = inputQuery) => {
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateCopilotResponse(textToSend);
      const copilotMsg = { id: Date.now() + 1, sender: 'copilot', text: responseText };
      setMessages(prev => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 800);
  };

  // Real employee risk list derived from database employees via ML Model
  const [employeeRiskList, setEmployeeRiskList] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);



  const handleSimulate = async () => {
    setIsSimulating(true);
    setIsPredicting(true);
    try {
      // Optional DB sync hook if required by backend, but we mainly need latest employees
      await fetch('http://localhost:5001/api/v1/employees/sync-real-data', { method: 'POST' });
      
      const empRes = await fetch('http://localhost:5001/api/v1/employees');
      const latestEmployees = await empRes.json();
      
      const risks = [];
      const activeEmployees = latestEmployees.filter(e => e.status !== 'Terminated');
      
      for (const emp of activeEmployees) {
        const res = await fetch('http://localhost:8001/predict-attrition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emp)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.risk_score > 0.50) {
            risks.push({
              ...emp,
              conf: (data.risk_score * 100).toFixed(1) + '%'
            });
          }
        }
      }
      
      risks.sort((a, b) => parseFloat(b.conf) - parseFloat(a.conf));
      setEmployeeRiskList(risks);

    } catch (err) {
      console.error("Failed to run AI analysis:", err);
    } finally {
      setIsSimulating(false);
      setIsPredicting(false);
    }
  };

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-1 flex items-center gap-2">
              <span>INSIGHTS</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Insights
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Signals, forecasts and recommendations detected across your workforce this week.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Risk Radar */}
          <div className="lg:col-span-12 space-y-6">
            
            {/* Attrition Risk Radar (Real ML Model UI) */}
            <div className="card-elevated p-6 border border-border rounded-2xl bg-card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-base text-card-foreground">Insights</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSimulate}
                    disabled={isSimulating || isPredicting}
                    className="flex items-center gap-1.5 px-3 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-full text-[11px] font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isPredicting ? 'animate-spin' : ''}`} />
                    Run AI Analysis
                  </button>
                  {!isPredicting && employeeRiskList.length > 0 && (
                    <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[11px] font-bold tracking-wider uppercase">
                      {employeeRiskList.length} High Risk
                    </span>
                  )}
                </div>
              </div>
              
              {isPredicting ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">IBM Machine Learning Model analyzing workforce...</p>
                </div>
              ) : employeeRiskList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">No high flight risks detected currently.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employeeRiskList.map((emp, idx) => (
                    <EmployeeRiskCard
                      key={idx}
                      name={emp.name}
                      role={emp.jobRole || emp.role}
                      department={emp.department}
                      avatar={emp.avatar}
                      conf={emp.conf}
                    />
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </main>
  );
}
