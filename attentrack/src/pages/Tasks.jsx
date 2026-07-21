import React from 'react';
import { Plus, MoreHorizontal, MessageSquare, Paperclip } from 'lucide-react';

const columns = [
  {
    id: 'todo',
    title: 'To Do',
    count: 2,
    dotColor: 'bg-slate-500',
    tasks: [
      {
        id: 'T-1043',
        title: 'Prepare August payroll batch',
        dueDate: 'Jul 28',
        priority: 'High',
        progress: 20,
        comments: 2,
        attachments: 1,
        avatar: 'https://i.pravatar.cc/150?u=12'
      },
      {
        id: 'T-1047',
        title: 'Compliance training rollout',
        dueDate: 'Aug 20',
        priority: 'Medium',
        progress: 10,
        comments: 4,
        attachments: 2,
        avatar: 'https://i.pravatar.cc/150?u=13'
      }
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    count: 3,
    dotColor: 'bg-blue-500',
    tasks: [
      {
        id: 'T-1041',
        title: 'Publish Q3 engineering roadmap',
        dueDate: 'Jul 22',
        priority: 'High',
        progress: 62,
        comments: 2,
        attachments: 1,
        avatar: 'https://i.pravatar.cc/150?u=14'
      },
      {
        id: 'T-1044',
        title: 'Redesign performance review flow',
        dueDate: 'Aug 04',
        priority: 'Medium',
        progress: 45,
        comments: 4,
        attachments: 2,
        avatar: 'https://i.pravatar.cc/150?u=15'
      },
      {
        id: 'T-1045',
        title: 'Ship benefits portal v2',
        dueDate: 'Aug 10',
        priority: 'High',
        progress: 71,
        comments: 6,
        attachments: 3,
        avatar: 'https://i.pravatar.cc/150?u=16'
      }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    count: 2,
    dotColor: 'bg-amber-500',
    tasks: [
      {
        id: 'T-1042',
        title: 'Roll out new onboarding checklist',
        dueDate: 'Jul 18',
        priority: 'Medium',
        progress: 88,
        comments: 2,
        attachments: 1,
        avatar: 'https://i.pravatar.cc/150?u=17'
      },
      {
        id: 'T-1048',
        title: 'Q3 hiring plan sign-off',
        dueDate: 'Jul 19',
        priority: 'High',
        progress: 82,
        comments: 4,
        attachments: 2,
        avatar: 'https://i.pravatar.cc/150?u=18'
      }
    ]
  },
  {
    id: 'done',
    title: 'Done',
    count: 1,
    dotColor: 'bg-green-500',
    tasks: [
      {
        id: 'T-1046',
        title: 'Draft remote work policy update',
        dueDate: 'Jul 12',
        priority: 'Low',
        progress: 100,
        comments: 2,
        attachments: 1,
        avatar: 'https://i.pravatar.cc/150?u=19'
      }
    ]
  }
];

const PriorityBadge = ({ priority }) => {
  const colors = {
    High: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    Medium: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    Low: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[priority]}`}>
      {priority}
    </span>
  );
};

export default function Tasks() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">

        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-500">Work</div>
            <h1 className="truncate text-3xl font-semibold tracking-tight">Tasks</h1>
            <p className="mt-1 text-sm text-muted-foreground">Personal, team and department tasks. Kanban, list and calendar views.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 h-10 px-5 rounded-full text-sm font-medium transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> New task
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-4 min-h-[calc(100vh-250px)]">
          {columns.map(col => (
            <div key={col.id} className="bg-muted/95 dark:bg-muted/20 border border-border/50 rounded-2xl shadow-md flex flex-col h-full">

              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <h3 className="font-semibold text-sm">{col.title}</h3>
                  <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {col.count}
                  </span>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Tasks */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {col.tasks.map(task => (
                  <div key={task.id} className="card-elevated hover-lift bg-card border border-border/80 p-4 cursor-grab">
                    <div className="flex items-center justify-between mb-3">
                      <PriorityBadge priority={task.priority} />
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-semibold text-sm leading-snug mb-1">{task.title}</h4>
                    <div className="text-[11px] text-muted-foreground mb-4">
                      {task.id} &middot; due {task.dueDate}
                    </div>

                    {col.id !== 'done' && (
                      <div className="mb-4">
                        <div className="h-1 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden mb-1.5">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${task.progress}%` }} />
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {task.progress}% complete
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <img src={task.avatar} alt="Assignee" className="w-6 h-6 rounded-full border border-border" />
                      <div className="flex items-center gap-3 text-muted-foreground text-[11px] font-medium">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {task.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5" />
                          {task.attachments}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
