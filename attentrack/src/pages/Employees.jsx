import React from 'react';
import { Search, Filter, Users, Mail, MapPin, Phone, Download, Plus, ChevronDown, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';

const employees = [
  {
    id: 1,
    name: "Aiko Suzuki",
    initials: "AS",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    role: "Legal Counsel",
    department: "Legal",
    email: "aiko.suzuki@northwind.co",
    location: "Singapore",
    status: "Active",
    skills: ["GraphQL", "Leadership", "SQL"]
  },
  {
    id: 2,
    name: "Alex Johnson",
    initials: "AJ",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    role: "Senior Developer",
    department: "Engineering",
    email: "alex.j@northwind.co",
    location: "London",
    status: "Active",
    skills: ["React", "TypeScript", "Node.js"]
  },
  {
    id: 3,
    name: "Sarah Chen",
    initials: "SC",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    role: "Product Manager",
    department: "Product",
    email: "sarah.c@northwind.co",
    location: "New York",
    status: "On Leave",
    skills: ["Agile", "Strategy", "UX"]
  },
  {
    id: 4,
    name: "Michael Torres",
    initials: "MT",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    role: "UX Designer",
    department: "Design",
    email: "m.torres@northwind.co",
    location: "San Francisco",
    status: "Active",
    skills: ["Figma", "Prototyping", "Research"]
  },
  {
    id: 5,
    name: "Emily Davis",
    initials: "ED",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    role: "HR Specialist",
    department: "Human Resources",
    email: "emily.d@northwind.co",
    location: "Chicago",
    status: "Active",
    skills: ["Recruiting", "Onboarding", "Policy"]
  }
];

export default function Employees() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-start justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-primary uppercase mb-1">People</div>
            <h1 className="text-2xl font-semibold tracking-tight">Employee directory</h1>
            <p className="text-sm text-muted-foreground mt-1">Every teammate, one search away. Filter by department, role, location and more.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-xl gap-2 cursor-pointer">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-xl gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              Add employee
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: '250' },
            { label: 'Full-time', value: '157' },
            { label: 'Contractors', value: '28' },
            { label: 'Departments', value: '12' },
            { label: 'Countries', value: '5' }
          ].map((metric, i) => (
            <div key={i} className="card-elevated p-4 flex flex-col justify-center gap-1">
              <span className="text-[13px] text-muted-foreground font-medium">{metric.label}</span>
              <span className="text-2xl font-semibold tracking-tight">{metric.value}</span>
            </div>
          ))}
        </div>

        <div className="card-elevated p-2 flex flex-col md:flex-row items-center gap-2">
          <div className="relative flex-1 w-full flex items-center pl-2">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input 
              placeholder="Search by name, email or role..." 
              className="flex h-9 w-full bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 border-0"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="inline-flex items-center justify-between whitespace-nowrap rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 min-w-[140px] cursor-pointer">
              All departments
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 gap-2 cursor-pointer">
              <SlidersHorizontal className="h-4 w-4" />
              More filters
            </button>
            <div className="inline-flex items-center justify-center rounded-lg bg-secondary/50 p-1 h-9">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all bg-background text-foreground shadow-sm h-7 gap-2 cursor-pointer">
                <LayoutGrid className="h-4 w-4" />
                Grid
              </button>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all text-muted-foreground hover:text-foreground h-7 gap-2 cursor-pointer">
                <List className="h-4 w-4" />
                Table
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map(emp => (
            <div key={emp.id} className="card-elevated hover-lift overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
              <div className="px-4 pb-4 -mt-8">
                <div className="flex items-end justify-between">
                  <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-card bg-background">
                    {emp.avatar ? (
                      <img className="aspect-square h-full w-full object-cover" src={emp.avatar} alt={emp.name} />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">{emp.initials}</span>
                    )}
                  </span>
                  <div className={`inline-flex items-center border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-0 rounded-md text-[10px] px-2 py-0.5 ${emp.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {emp.status}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="font-semibold truncate">{emp.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{emp.role} · {emp.department}</div>
                </div>
                <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {emp.location}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {emp.skills.map((skill, idx) => (
                    <div key={idx} className="inline-flex items-center border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md text-[10px] font-normal border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2 py-0.5">
                      {skill}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-1.5">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 flex-1 rounded-lg text-xs">
                    View
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs rounded-lg">
                    <Mail className="h-3.5 w-3.5" />
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs rounded-lg">
                    <Phone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
