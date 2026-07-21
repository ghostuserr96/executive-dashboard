import React from 'react';

const PagePlaceholder = ({ title, description }) => (
  <main className="flex-1 min-w-0 overflow-y-auto">
    <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="card-elevated min-h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">This section is currently under development.</p>
      </div>
    </div>
  </main>
);

export default function Learning() { return <PagePlaceholder title="Learning & Development" description="Courses, training, and professional growth." />; }
