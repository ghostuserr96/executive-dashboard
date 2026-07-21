import React from 'react';
import { 
  Building, 
  Users, 
  CalendarClock, 
  Wallet,
  Bell,
  Palette,
  Shield,
  Plug
} from 'lucide-react';

const ToggleSwitch = ({ isOn }) => (
  <button 
    className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${isOn ? 'bg-primary' : 'bg-muted-foreground/30'}`}
    aria-checked={isOn}
    role="switch"
  >
    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0'}`}></div>
  </button>
);

const PreferenceItem = ({ title, description, isOn }) => (
  <div className="flex items-center justify-between py-4">
    <div>
      <div className="font-medium text-[15px] text-card-foreground">{title}</div>
      <div className="text-[13px] text-muted-foreground">{description}</div>
    </div>
    <ToggleSwitch isOn={isOn} />
  </div>
);

const ConfigCard = ({ title, description, icon: Icon }) => (
  <div className="card-elevated p-6 border border-border rounded-2xl bg-card hover:border-border/80 transition-colors flex flex-col justify-between">
    <div className="flex justify-between items-start mb-8">
      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <span className="px-2.5 py-1 bg-muted text-muted-foreground text-[11px] font-semibold rounded-full tracking-wide">
        Configure
      </span>
    </div>
    <div>
      <h3 className="font-semibold text-[15px] text-card-foreground mb-1">{title}</h3>
      <p className="text-[13px] text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default function Settings() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-8">
        
        {/* Header */}
        <div className="pt-2">
          <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-2">
            ADMIN
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Settings
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Configure your organization, rules and integrations.
          </p>
        </div>

        {/* Top Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Organization Profile */}
          <div className="lg:col-span-8 card-elevated p-6 border border-border rounded-2xl bg-card">
            <h3 className="font-semibold text-[15px] text-card-foreground mb-6">Organization profile</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-2">Company name</label>
                  <input type="text" defaultValue="Northwind Labs" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-2">Legal entity</label>
                  <input type="text" defaultValue="Northwind Labs Inc." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-2">Support email</label>
                  <input type="email" defaultValue="people@northwind.co" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-2">Primary time zone</label>
                  <input type="text" defaultValue="America/Los_Angeles" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">Mission statement</label>
                <input type="text" defaultValue="People Operations, reimagined." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-primary/50" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button className="px-5 py-2.5 rounded-full border border-border bg-card text-[14px] font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button className="px-5 py-2.5 rounded-full bg-primary text-[14px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Save changes
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="lg:col-span-4 card-elevated p-6 border border-border rounded-2xl bg-card">
            <h3 className="font-semibold text-[15px] text-card-foreground mb-2">Preferences</h3>
            
            <div className="divide-y divide-border/50">
              <PreferenceItem 
                title="Enable dark mode by default" 
                description="Applies to new members" 
                isOn={false} 
              />
              <PreferenceItem 
                title="AI Copilot suggestions" 
                description="Show weekly insights on dashboard" 
                isOn={true} 
              />
              <PreferenceItem 
                title="Anonymous engagement surveys" 
                description="Employees can respond anonymously" 
                isOn={true} 
              />
              <PreferenceItem 
                title="Two-factor auth" 
                description="Required for admins" 
                isOn={true} 
              />
            </div>
          </div>

        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pt-2">
          <ConfigCard 
            title="Organization"
            description="Company profile & branding"
            icon={Building}
          />
          <ConfigCard 
            title="Roles & permissions"
            description="7 roles configured"
            icon={Users}
          />
          <ConfigCard 
            title="Shift rules"
            description="3 shift templates"
            icon={CalendarClock}
          />
          <ConfigCard 
            title="Payroll rules"
            description="Tax, PF, ESI, deductions"
            icon={Wallet}
          />
          <ConfigCard 
            title="Notifications"
            description="Email, SMS, in-app, Slack"
            icon={Bell}
          />
          <ConfigCard 
            title="Branding"
            description="Logo, colors, email templates"
            icon={Palette}
          />
          <ConfigCard 
            title="Security"
            description="SSO, 2FA, IP allowlists"
            icon={Shield}
          />
          <ConfigCard 
            title="Integrations"
            description="Slack, Google, Zoom, Stripe"
            icon={Plug}
          />
        </div>

      </div>
    </main>
  );
}
