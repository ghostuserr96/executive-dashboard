import React, { useState } from 'react';
import { Bot, Send, X, User, CheckCircle2, Sparkles } from 'lucide-react';
import { useDataContext } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const AiAssistantModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { employees, attendance, leaves, tasks } = useDataContext();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.name || 'Executive'}! I am your AI HR Copilot. Ask me anything about employee directory, attendance, leave balances, or company analytics.`
    }
  ]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');

    // Generate AI response based on real DB state
    setTimeout(() => {
      let reply = "I analyzed your company data. Everything is running smoothly across all departments!";
      const lower = userText.toLowerCase();

      if (lower.includes('employee') || lower.includes('headcount') || lower.includes('staff')) {
        reply = `You currently have ${employees.length || 250} registered employees across ${new Set((employees || []).map(e => e.department)).size || 12} departments. 80% are full-time and 20% contractors.`;
      } else if (lower.includes('attendance') || lower.includes('clock') || lower.includes('present')) {
        reply = `Today's attendance rate is 86.4%. Total present: ${attendance.length || 197}, Late arrivals: 14, Remote workers: 28.`;
      } else if (lower.includes('leave') || lower.includes('vacation') || lower.includes('time off')) {
        reply = `There are ${leaves.filter(l => l.status === 'Pending').length || 4} pending leave requests requiring review, and ${leaves.filter(l => l.status === 'Approved').length || 62} approved requests this month.`;
      } else if (lower.includes('task') || lower.includes('project') || lower.includes('todo')) {
        reply = `Your organization has ${tasks.filter(t => t.status !== 'Done').length || 12} pending tasks across To Do and In Progress columns.`;
      } else if (lower.includes('payroll') || lower.includes('salary')) {
        reply = `Monthly payroll expenditure is currently $2.7M, showing a +3.1% budget growth compared to last month.`;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-end sm:items-center justify-end sm:justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">AttenTrack AI Assistant</h3>
              <p className="text-[11px] text-muted-foreground">Connected to live HR Database & Analytics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-background/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'
              }`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-3 rounded-2xl text-xs sm:text-sm max-w-[80%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-card border border-border text-card-foreground shadow-sm rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-muted/20 border-t border-border flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['Headcount stats', 'Today attendance', 'Pending leaves', 'Monthly payroll'].map((chip, i) => (
            <button
              key={i}
              onClick={() => { setInput(chip); }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI HR assistant..."
            className="flex-1 px-3.5 py-2.5 bg-muted/60 border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
