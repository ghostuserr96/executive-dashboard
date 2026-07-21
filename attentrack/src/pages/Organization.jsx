import React from 'react';
import { 
  Users, 
  Building2, 
  MapPin, 
  UserCheck,
  Building
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="card-elevated p-6 border border-border rounded-2xl bg-card flex justify-between items-start hover:border-border/80 transition-colors">
    <div>
      <h3 className="font-medium text-[14px] text-muted-foreground mb-1">{title}</h3>
      <div className="text-3xl font-bold text-foreground">{value}</div>
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

const UserNode = ({ name, role, teamCount, isRoot }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-3 px-5 py-3 rounded-full border border-border bg-card shadow-sm z-10 hover:border-border/80 transition-colors">
      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=f1f5f9`} alt={name} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="font-semibold text-[14px] text-card-foreground leading-tight">{name}</h4>
        <p className="text-[12px] text-muted-foreground">{role}</p>
      </div>
    </div>
    
    {!isRoot && (
      <div className="flex items-center mt-3 gap-1.5 z-10">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-card bg-muted overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}${i}&backgroundColor=f8fafc`} alt="Team member" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <span className="text-[12px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {teamCount}
        </span>
      </div>
    )}
  </div>
);

const LocationCard = ({ city, type, total, present, remote, absent }) => (
  <div className="card-elevated p-6 border border-border rounded-2xl bg-card hover:border-border/80 transition-colors">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Building className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-card-foreground">{city}</h3>
          <p className="text-[13px] text-muted-foreground">{type}</p>
        </div>
      </div>
      <div className="text-[14px] font-medium text-card-foreground">
        {total} people
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="bg-muted/50 rounded-lg py-2">
        <div className="text-[15px] font-semibold text-card-foreground">{present}</div>
        <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Present</div>
      </div>
      <div className="bg-muted/50 rounded-lg py-2">
        <div className="text-[15px] font-semibold text-card-foreground">{remote}</div>
        <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Remote</div>
      </div>
      <div className="bg-muted/50 rounded-lg py-2">
        <div className="text-[15px] font-semibold text-card-foreground">{absent}</div>
        <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Absent</div>
      </div>
    </div>
  </div>
);

export default function Organization() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-8">
        
        {/* Header */}
        <div className="pt-2">
          <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-2">
            ORGANIZATION
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Northwind Labs
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Reporting hierarchy, branches, departments and workforce composition.
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard title="Total employees" value="250" icon={Users} colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
          <StatCard title="Departments" value="12" icon={Building2} colorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" />
          <StatCard title="Branches" value="5" icon={MapPin} colorClass="bg-green-500/10 text-green-600 dark:text-green-400" />
          <StatCard title="Managers" value="18" icon={UserCheck} colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Reporting Hierarchy */}
        <div className="card-elevated border border-border rounded-2xl bg-card p-6 lg:p-10 overflow-hidden">
          <h3 className="font-semibold text-[15px] text-card-foreground mb-8">Reporting hierarchy</h3>
          
          <div className="flex flex-col items-center justify-center relative min-w-[800px] overflow-x-auto pb-6">
            
            {/* Root Node */}
            <UserNode name="Aiko Suzuki" role="Chief Executive Officer" isRoot={true} />
            
            {/* Vertical Line from Root */}
            <div className="w-px h-10 bg-border/80"></div>
            
            {/* Horizontal Line Connecting Children */}
            <div className="w-[75%] h-px bg-border/80 relative">
              {/* Vertical Lines down to children */}
              <div className="absolute top-0 left-0 w-px h-6 bg-border/80"></div>
              <div className="absolute top-0 left-[33.33%] w-px h-6 bg-border/80"></div>
              <div className="absolute top-0 left-[66.66%] w-px h-6 bg-border/80"></div>
              <div className="absolute top-0 right-0 w-px h-6 bg-border/80"></div>
            </div>

            {/* Children Nodes Row */}
            <div className="flex justify-between w-[85%] mt-6 relative">
              <UserNode name="Mateo Watanabe" role="VP People" teamCount="20" />
              <UserNode name="Hiro White" role="VP Engineering" teamCount="26" />
              <UserNode name="Meera Park" role="VP Product" teamCount="32" />
              <UserNode name="Vikram Miller" role="VP Revenue" teamCount="38" />
            </div>
            
          </div>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          <LocationCard city="San Francisco" type="Regional HQ" total={44} present={40} remote={4} absent={2} />
          <LocationCard city="New York" type="Regional HQ" total={58} present={43} remote={5} absent={2} />
          <LocationCard city="London" type="Regional HQ" total={47} present={46} remote={6} absent={2} />
          <LocationCard city="Bangalore" type="Regional HQ" total={54} present={49} remote={7} absent={2} />
          <LocationCard city="Singapore" type="Regional HQ" total={47} present={52} remote={8} absent={2} />
        </div>

      </div>
    </main>
  );
}
