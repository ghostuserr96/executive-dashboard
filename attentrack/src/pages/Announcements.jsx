import React from 'react';
import { 
  Megaphone, 
  ThumbsUp, 
  MessageSquare, 
  Pin,
  Cake,
  PartyPopper
} from 'lucide-react';

const AnnouncementCard = ({ title, author, time, description, likes, comments, isPinned }) => (
  <div className="card-elevated p-6 border border-border rounded-2xl bg-card transition-colors hover:border-border/80">
    <div className="flex gap-4">
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
        <Megaphone className="w-5 h-5" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <h3 className="font-semibold text-[15px] text-card-foreground">{title}</h3>
          {isPinned && (
            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium flex items-center gap-1">
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
        </div>
        <p className="text-[13px] text-muted-foreground mb-4">
          {author} · {time}
        </p>
        <p className="text-[14px] text-card-foreground leading-relaxed mb-5">
          {description}
        </p>
        
        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors group">
            <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{likes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors group">
            <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{comments} comments</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const BirthdayCard = ({ name, role }) => (
  <div className="flex items-center justify-between py-3 group">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=f1f5f9`} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0">
        <h4 className="font-medium text-[14px] text-card-foreground truncate">{name}</h4>
        <p className="text-[12px] text-muted-foreground truncate">{role}</p>
      </div>
    </div>
    <button className="px-4 py-1.5 rounded-full border border-border text-[12px] font-medium text-foreground hover:bg-muted transition-colors bg-card shadow-sm ml-2 shrink-0">
      Wish
    </button>
  </div>
);

const AnniversaryCard = ({ name, role, tenure }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=f1f5f9`} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0">
        <h4 className="font-medium text-[14px] text-card-foreground truncate">{name}</h4>
        <p className="text-[12px] text-muted-foreground truncate">{tenure} · {role}</p>
      </div>
    </div>
  </div>
);

export default function Announcements() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-2">
              COMPANY FEED
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Announcements
            </h1>
            <p className="text-[15px] text-muted-foreground">
              News, celebrations and updates for the entire company.
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <Megaphone className="w-4 h-4" />
            Post announcement
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Feed */}
          <div className="lg:col-span-8 space-y-4">
            <AnnouncementCard 
              title="New parental leave policy"
              author="People Ops"
              time="2h ago"
              description="Effective Aug 1, extended to 20 weeks for all parents worldwide."
              likes={42}
              comments={8}
              isPinned={true}
            />
            <AnnouncementCard 
              title="Q3 All-Hands next Friday"
              author="CEO Office"
              time="Yesterday"
              description="Join us at 10:00 PT for the quarterly business review and product preview."
              likes={42}
              comments={8}
            />
            <AnnouncementCard 
              title="Open enrollment now live"
              author="Benefits"
              time="2d ago"
              description="Update your benefits selections before July 31."
              likes={42}
              comments={8}
            />
          </div>

          {/* Right Column - Widgets */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Birthdays Widget */}
            <div className="card-elevated p-6 border border-border rounded-2xl bg-card">
              <div className="flex items-center gap-2 mb-4">
                <Cake className="w-4.5 h-4.5 text-amber-500" />
                <h3 className="font-semibold text-[15px] text-card-foreground">Today's birthdays</h3>
              </div>
              <div className="divide-y divide-border/50">
                <BirthdayCard name="Vikram Miller" role="Data & Analytics" />
                <BirthdayCard name="Aiko Hassan" role="Data & Analytics" />
                <BirthdayCard name="Jack Suzuki" role="IT Ops" />
              </div>
            </div>

            {/* Anniversaries Widget */}
            <div className="card-elevated p-6 border border-border rounded-2xl bg-card">
              <div className="flex items-center gap-2 mb-4">
                <PartyPopper className="w-4.5 h-4.5 text-sky-500" />
                <h3 className="font-semibold text-[15px] text-card-foreground">Work anniversaries</h3>
              </div>
              <div className="divide-y divide-border/50">
                <AnniversaryCard name="Anastasia Menon" tenure="2 years" role="Operations" />
                <AnniversaryCard name="Mia Tanaka" tenure="3 years" role="Product" />
                <AnniversaryCard name="Kenji Watanabe" tenure="4 years" role="Legal" />
                <AnniversaryCard name="Anastasia Verma" tenure="5 years" role="Finance" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
