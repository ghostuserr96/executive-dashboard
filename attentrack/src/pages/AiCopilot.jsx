import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  BrainCircuit, 
  Send
} from 'lucide-react';

const InsightCard = ({ type, title, description, badgeText }) => {
  let icon, colorClass, badgeClass;

  switch (type) {
    case 'risk':
      icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
      colorClass = 'bg-amber-500/10 text-amber-500';
      badgeClass = 'bg-muted text-muted-foreground';
      break;
    case 'opportunity':
      icon = <Lightbulb className="w-5 h-5 text-sky-500" />;
      colorClass = 'bg-sky-500/10 text-sky-500';
      badgeClass = 'bg-muted text-muted-foreground';
      break;
    case 'insight':
      icon = <TrendingUp className="w-5 h-5 text-blue-500" />;
      colorClass = 'bg-blue-500/10 text-blue-500';
      badgeClass = 'bg-muted text-muted-foreground';
      break;
    case 'recommendation':
      icon = <Sparkles className="w-5 h-5 text-emerald-500" />;
      colorClass = 'bg-emerald-500/10 text-emerald-500';
      badgeClass = 'bg-muted text-muted-foreground';
      break;
    default:
      icon = <Sparkles className="w-5 h-5" />;
      colorClass = 'bg-muted';
      badgeClass = 'bg-muted text-muted-foreground';
  }

  return (
    <div className="card-elevated p-6 flex flex-col justify-between h-full bg-card border border-border rounded-2xl">
      <div>
        <div className="flex justify-between items-start mb-5">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
            {icon}
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${badgeClass}`}>
            {badgeText || type}
          </span>
        </div>
        <h3 className="font-semibold text-[15px] mb-2 text-card-foreground">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="px-5 py-2 rounded-full border border-border text-[13px] font-medium text-foreground hover:bg-muted transition-colors bg-card shadow-sm">
          Dismiss
        </button>
        <button className="px-5 py-2 rounded-full bg-primary text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
          Take action
        </button>
      </div>
    </div>
  );
};

const EmployeeRiskCard = ({ name, role, conf }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-border/80 transition-colors bg-card">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
         <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=f1f5f9`} alt={name} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="font-medium text-sm text-card-foreground">{name}</h4>
        <p className="text-[13px] text-muted-foreground">{role}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="font-medium text-sm text-destructive mb-0.5">High</div>
      <div className="text-[11px] text-muted-foreground font-medium">{conf} conf.</div>
    </div>
  </div>
);


export default function AiCopilot() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pt-2">
          <div>
            <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-2">
              AI COPILOT
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Your intelligent HR partner
            </h1>
            <p className="text-[15px] text-muted-foreground">
              Signals, forecasts and recommendations detected across your workforce this week.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold hover:bg-primary/20 transition-colors border border-primary/20">
            <Sparkles className="w-4 h-4" />
            4 new insights
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Insights & Radar */}
          <div className="lg:col-span-8 space-y-6">
            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <InsightCard 
                type="risk"
                badgeText="RISK"
                title="5 employees at elevated attrition risk"
                description="Model detected drop in engagement + declining PR reviews for 5 engineers on Platform team. Suggest 1:1s this week."
              />
              <InsightCard 
                type="opportunity"
                badgeText="OPPORTUNITY"
                title="Sales team burnout signals"
                description="Average working hours up 18% in Sales for 3 weeks. Consider redistributing Q3 quota or approving comp-off."
              />
              <InsightCard 
                type="insight"
                badgeText="INSIGHT"
                title="Hiring velocity up 22% QoQ"
                description="Time-to-hire dropped from 32 to 25 days. Referrals converting at 3.4× industry average."
              />
              <InsightCard 
                type="recommendation"
                badgeText="RECOMMENDATION"
                title="Promote 4 high-potential ICs"
                description="Ananya Nair, Aarav Sharma, Meera Gupta, and Kai Nakamura meet all promotion readiness criteria."
              />
            </div>

            {/* Attrition Risk Radar */}
            <div className="card-elevated p-6 border border-border rounded-2xl bg-card mt-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-[15px] text-card-foreground mb-1">Attrition risk radar</h3>
                  <p className="text-[13px] text-muted-foreground">Model updated 12 min ago</p>
                </div>
                <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-[11px] font-bold tracking-wider uppercase">
                  5 flagged
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EmployeeRiskCard name="Priya Santos" role="Design Lead · Design" conf="78%" />
                <EmployeeRiskCard name="Henry Nakamura" role="Design Lead · Design" conf="78%" />
                <EmployeeRiskCard name="Camila Smith" role="HR Business Partner · People Ops" conf="78%" />
                <EmployeeRiskCard name="Valentina Williams" role="UX Researcher · Design" conf="78%" />
                <EmployeeRiskCard name="Isha Thomas" role="Product Manager · Product" conf="78%" />
              </div>
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-4">
            <div className="card-elevated border border-border h-full min-h-[700px] flex flex-col rounded-2xl overflow-hidden sticky top-8 bg-card shadow-sm">
              
              {/* Chat Header */}
              <div className="px-6 py-5 border-b border-border flex items-center gap-3 bg-card">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-card-foreground leading-tight mb-0.5">Ask Copilot</h3>
                  <p className="text-[13px] text-muted-foreground">Natural language HR queries</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-card">
                
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] text-[14px] leading-relaxed shadow-sm font-medium">
                    Which teams are at burnout risk this month?
                  </div>
                </div>

                {/* Copilot Message */}
                <div className="flex gap-3 max-w-[95%]">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[14px] text-card-foreground leading-[1.6] pt-1 font-medium">
                      <p className="mb-4">Sales team leads with 18% higher working hours over the last 3 weeks and rising after-hours activity. I'd recommend redistributing Q3 quota or approving 2 comp-off days.</p>
                      <p>Engineering Platform team is also flagged — 3 engineers had declining PR review cadence.</p>
                    </div>
                    
                    {/* Suggestions */}
                    <div className="flex flex-wrap gap-2 mt-5">
                      <button className="px-4 py-1.5 rounded-full border border-border text-[13px] font-medium text-foreground hover:bg-muted transition-colors bg-card">
                        Draft July HR summary
                      </button>
                      <button className="px-4 py-1.5 rounded-full border border-border text-[13px] font-medium text-foreground hover:bg-muted transition-colors bg-card">
                        Who's on leave next week?
                      </button>
                      <button className="px-4 py-1.5 rounded-full border border-border text-[13px] font-medium text-foreground hover:bg-muted transition-colors bg-card">
                        Show hiring pipeline
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chat Input */}
              <div className="p-4 bg-card border-t border-border">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask anything about your team..." 
                    className="w-full border border-border rounded-full pl-5 pr-12 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-background shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] placeholder-muted-foreground text-foreground"
                  />
                  <button className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm">
                    <Send className="w-4.5 h-4.5 ml-0.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </main>
  );
}
