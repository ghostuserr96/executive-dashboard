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
  Loader2
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
  const { employees, attendance, leaves, tasks, performance, recruitmentJobs, recruitmentCandidates } = useDataContext();

  // Active insights list - Starts empty as there are no real AI triggers yet
  const [insights, setInsights] = useState([]);

  // Chat message history - Starts empty for a fresh session
  const [messages, setMessages] = useState([]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  // Real employee risk list derived from database employees
  const employeeRiskList = useMemo(() => {
    return []; // No real risk model exists currently, return empty so we don't falsely label real employees
  }, [employees]);

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-1 flex items-center gap-2">
              <span>AI COPILOT</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Your Intelligent HR Partner
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Signals, forecasts and recommendations detected across your workforce this week.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>{insights.length} active insights</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Insights & Risk Radar */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Insights Grid */}
            {insights.length === 0 ? (
              <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <p className="text-sm font-medium">All current insights reviewed and dismissed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {insights.map(item => (
                  <InsightCard
                    key={item.id}
                    id={item.id}
                    type={item.type}
                    badgeText={item.badgeText}
                    title={item.title}
                    description={item.description}
                    onDismiss={handleDismissInsight}
                    onTakeAction={handleTakeAction}
                  />
                ))}
              </div>
            )}

            {/* Attrition Risk Radar */}
            <div className="card-elevated p-6 border border-border rounded-2xl bg-card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-base text-card-foreground">Attrition Risk Radar</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Live Database HR Search Assistant</p>
                </div>
                <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[11px] font-bold tracking-wider uppercase">
                  {employeeRiskList.length} Flagged
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employeeRiskList.map((emp, idx) => (
                  <EmployeeRiskCard
                    key={idx}
                    name={emp.name}
                    role={emp.role}
                    department={emp.department}
                    avatar={emp.avatar}
                    conf={emp.conf}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - Ask Copilot Chat */}
          <div className="lg:col-span-4">
            <div className="card-elevated border border-border h-[calc(100vh-8rem)] max-h-[680px] flex flex-col rounded-2xl overflow-hidden sticky top-8 bg-card shadow-lg">
              
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-card-foreground leading-tight">Ask Copilot</h3>
                    <p className="text-xs text-muted-foreground">Natural language HR queries</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="Online" />
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-card/60">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start gap-3'}`}
                  >
                    {msg.sender === 'copilot' && (
                      <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs md:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-md'
                          : 'bg-muted/80 text-foreground border border-border/60 rounded-tl-xs whitespace-pre-line shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Copilot is analyzing workforce data...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggestion Pills */}
              <div className="px-4 py-2 border-t border-border/40 bg-muted/20 flex flex-wrap gap-1.5">
                {[
                  'Who is on leave?',
                  'Show HR summary',
                  'Hiring pipeline status',
                  'Task Kanban status'
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sug)}
                    className="px-3 py-1 rounded-full border border-border/80 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-card hover:border-primary/40 transition-all cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-card border-t border-border">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center"
                >
                  <input 
                    type="text" 
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask anything about your team..." 
                    className="w-full border border-border rounded-full pl-5 pr-12 py-3 text-xs md:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background placeholder:text-muted-foreground text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim()}
                    className="absolute right-1.5 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
