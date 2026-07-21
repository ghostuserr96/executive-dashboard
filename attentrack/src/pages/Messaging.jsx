import React from 'react';
import {
  Hash,
  Plus,
  Send
} from 'lucide-react';

const ChannelItem = ({ name, unread, isActive }) => (
  <button className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
    <div className="flex items-center gap-2">
      <Hash className="w-4 h-4 opacity-70" />
      <span>{name}</span>
    </div>
    {unread && (
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
        {unread}
      </span>
    )}
  </button>
);

const DMItem = ({ name }) => (
  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
    <div className="w-6 h-6 rounded-full bg-muted overflow-hidden shrink-0">
      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=f1f5f9`} alt={name} className="w-full h-full object-cover" />
    </div>
    <span className="truncate">{name}</span>
  </button>
);

const ChatMessage = ({ name, time, message }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 mt-1">
      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=f1f5f9`} alt={name} className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline gap-2 mb-1">
        <h4 className="font-semibold text-[14px] text-card-foreground">{name}</h4>
        <span className="text-[12px] text-muted-foreground">{time}</span>
      </div>
      <p className="text-[14px] text-card-foreground leading-relaxed">
        {message}
      </p>
    </div>
  </div>
);

export default function Messaging() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50 h-full flex flex-col">
      <div className="mx-auto max-w-[1600px] w-full p-4 lg:p-8 flex-1 flex flex-col min-h-0 space-y-6">

        {/* Header */}
        <div className="pt-2 shrink-0">
          <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-2">
            TEAM CHAT
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Messaging
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Channels, DMs and announcements.
          </p>
        </div>

        {/* Messaging Interface */}
        <div className="card-elevated border border-border rounded-2xl bg-card flex-1 min-h-0 flex overflow-hidden shadow-sm lg:mr-24">

          {/* Sidebar */}
          <div className="w-64 shrink-0 border-r border-border flex flex-col overflow-y-auto p-4 hidden md:flex space-y-8">

            {/* Channels Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Channels</h3>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-0.5">
                <ChannelItem name="general" unread="3" />
                <ChannelItem name="announcements" />
                <ChannelItem name="engineering" unread="12" isActive={true} />
                <ChannelItem name="design" unread="5" />
                <ChannelItem name="sales-wins" />
                <ChannelItem name="people-ops" unread="1" />
              </div>
            </div>

            {/* DMs Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Direct Messages</h3>
              </div>
              <div className="space-y-1">
                <DMItem name="Aiko Suzuki" />
                <DMItem name="Mateo Watanabe" />
                <DMItem name="Hiro White" />
                <DMItem name="Meera Park" />
                <DMItem name="Vikram Miller" />
              </div>
            </div>

          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Hash className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold text-[16px] text-card-foreground leading-tight">engineering</h2>
              </div>
              <p className="text-[13px] text-muted-foreground pl-7">54 members · Team standups & shipping</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <ChatMessage
                name="Meera Park"
                time="9:12 AM"
                message="Kicking off the Q3 planning doc — feedback welcome 🙌"
              />
              <ChatMessage
                name="Aiko Smith"
                time="9:20 AM"
                message="Just shipped the new benefits portal to staging."
              />
              <ChatMessage
                name="Isabella Taylor"
                time="9:41 AM"
                message="Anyone free for a design review at 2pm?"
              />
              <ChatMessage
                name="Lucas Wilson"
                time="10:04 AM"
                message="Payroll batch for July is queued for approval. cc @ellen"
              />
              <ChatMessage
                name="Kenji Watanabe"
                time="10:32 AM"
                message="Recruiting update: 3 offers accepted this week 🎉"
              />
            </div>

            {/* Input Area */}
            <div className="p-4 shrink-0 bg-card border-t border-border">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Message #engineering"
                  className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-3 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-muted-foreground"
                />
                <button className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
