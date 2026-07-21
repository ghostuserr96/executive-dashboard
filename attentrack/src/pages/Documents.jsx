import React from 'react';
import { 
  Upload, 
  Search, 
  Folder, 
  FileText
} from 'lucide-react';

const CategoryCard = ({ title, count, colorClass }) => (
  <div className="card-elevated p-5 border border-border rounded-2xl bg-card hover:border-border/80 transition-colors flex flex-col justify-center min-w-[160px] flex-1">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
      <Folder className="w-5 h-5" />
    </div>
    <h3 className="font-semibold text-[15px] text-card-foreground mb-1">{title}</h3>
    <p className="text-[13px] text-muted-foreground">{count} files</p>
  </div>
);

const FileRow = ({ name, folder, size, modified, status }) => (
  <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
    <td className="py-4 px-2 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <FileText className="w-4.5 h-4.5" />
        </div>
        <span className="font-medium text-[14px] text-card-foreground">{name}</span>
      </div>
    </td>
    <td className="py-4 px-2 sm:px-6 text-[14px] text-muted-foreground hidden md:table-cell">{folder}</td>
    <td className="py-4 px-2 sm:px-6 text-[14px] text-muted-foreground hidden sm:table-cell">{size}</td>
    <td className="py-4 px-2 sm:px-6 text-[14px] text-muted-foreground hidden sm:table-cell">{modified}</td>
    <td className="py-4 px-2 sm:px-6 text-right sm:text-left">
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
        {status}
      </span>
    </td>
  </tr>
);

export default function Documents() {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div>
            <div className="text-primary font-semibold text-xs tracking-wider uppercase mb-2">
              DOCUMENT VAULT
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Documents
            </h1>
            <p className="text-[15px] text-muted-foreground">
              Encrypted storage with version history and audit trail.
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shrink-0">
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input 
            type="text" 
            placeholder="Search across all documents..." 
            className="w-full bg-card border border-border rounded-full pl-11 pr-4 py-3.5 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Categories Row */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 sm:gap-6 hide-scrollbar">
          <CategoryCard title="Contracts" count="248" colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
          <CategoryCard title="Payslips" count="3,000" colorClass="bg-green-500/10 text-green-600 dark:text-green-400" />
          <CategoryCard title="Policies" count="42" colorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" />
          <CategoryCard title="Certificates" count="178" colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          <CategoryCard title="IDs & Proofs" count="496" colorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
          <CategoryCard title="Onboarding" count="84" colorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Recent Files Table */}
        <div className="card-elevated border border-border rounded-2xl bg-card overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h3 className="font-semibold text-[15px] text-card-foreground">Recent files</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground">Name</th>
                  <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground hidden md:table-cell">Folder</th>
                  <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground hidden sm:table-cell">Size</th>
                  <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground hidden sm:table-cell">Modified</th>
                  <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground text-right sm:text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <FileRow 
                  name="Offer Letter - Priya Patel.pdf"
                  folder="Contracts"
                  size="184 KB"
                  modified="Jul 14"
                  status="Signed"
                />
                <FileRow 
                  name="July Payslip - Rohan Iyer.pdf"
                  folder="Payslips"
                  size="92 KB"
                  modified="Jul 12"
                  status="Auto"
                />
                <FileRow 
                  name="Remote Work Policy v3.2.pdf"
                  folder="Policies"
                  size="220 KB"
                  modified="Jul 10"
                  status="Published"
                />
                <FileRow 
                  name="AWS Certified Solutions Arch.pdf"
                  folder="Certificates"
                  size="1.2 MB"
                  modified="Jul 08"
                  status="Verified"
                />
                <FileRow 
                  name="Passport - Ananya Nair.jpg"
                  folder="IDs & Proofs"
                  size="620 KB"
                  modified="Jul 07"
                  status="Encrypted"
                />
                <FileRow 
                  name="Onboarding Kit - Marcus Reilly.zip"
                  folder="Onboarding"
                  size="3.4 MB"
                  modified="Jul 05"
                  status="Sent"
                />
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
