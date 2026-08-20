import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Upload,
  Search,
  Folder,
  FileText,
  File,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { documentService } from '../services/documentService';
import DocumentChat from '../components/DocumentChat';
import { CustomSelect } from '../components/common/CustomSelect';

const FOLDERS = ['All', 'Contracts', 'Payslips', 'Policies', 'Certificates', 'IDs & Proofs', 'Onboarding', 'General'];

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 KB';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

const formatDate = (isoString) => {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getFileIcon = (mimeType, name) => {
  if (!mimeType && !name) return <FileText className="w-4 h-4" />;
  if (mimeType && mimeType.startsWith('image/')) return <FileText className="w-4 h-4" />;
  if (mimeType && (mimeType.includes('pdf') || name?.toLowerCase().endsWith('.pdf'))) return <FileText className="w-4 h-4" />;
  if (mimeType && (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('tar'))) return <FileText className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

const CategoryCard = ({ title, count, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-full border transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 group hover:scale-[1.02] active:scale-[0.98]
      ${isActive 
        ? 'bg-primary border-primary text-primary-foreground' 
        : 'bg-card border-border hover:border-primary/40 hover:bg-primary/5 text-card-foreground'
      }`}
  >
    <div className={`flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5
      ${isActive ? 'text-primary-foreground' : 'text-primary'}`}>
      <Folder className="w-4 h-4 fill-current opacity-20 absolute" />
      <Folder className="w-4 h-4 relative z-10" />
    </div>
    <span className="font-semibold text-sm tracking-wide">{title}</span>
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ml-1 transition-colors
      ${isActive 
        ? 'bg-primary-foreground/20 text-primary-foreground' 
        : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
      }`}>
      {count}
    </span>
  </button>
);

const FileRow = ({ doc, onDelete, onView, onChat, isHR }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!isHR) return;
    setDeleting(true);
    try {
      await onDelete(doc.id);
    } catch (e) {
      console.warn('Delete failed:', e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-4 px-2 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {getFileIcon(doc.mimeType, doc.name)}
          </div>
          <span className="font-medium text-[14px] text-card-foreground truncate">{doc.name}</span>
        </div>
      </td>
      <td className="py-4 px-2 sm:px-6 text-[14px] text-muted-foreground hidden md:table-cell">{doc.folder}</td>
      <td className="py-4 px-2 sm:px-6 text-[14px] text-muted-foreground hidden sm:table-cell">{formatFileSize(doc.size)}</td>
      <td className="py-4 px-2 sm:px-6 text-[14px] text-muted-foreground hidden sm:table-cell">{formatDate(doc.createdAt)}</td>
      <td className="py-4 px-2 sm:px-6 text-[14px] text-muted-foreground hidden lg:table-cell">{doc.uploadedByName || '--'}</td>
      <td className="py-4 px-2 sm:px-6 text-right sm:text-left">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
          {doc.status || 'Active'}
        </span>
      </td>
      {isHR && (
        <td className="py-4 px-2 sm:px-6 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onChat(doc)}
              className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
              title="Chat with document"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => onView(doc)}
              className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
              title="View document"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
};

export default function Documents() {
  const { documents: rawDocuments, setDocuments, refreshDocuments } = useDataContext();

  const documents = useMemo(() => {
    if (!Array.isArray(rawDocuments)) return [];
    return rawDocuments.filter((doc) => doc.folder !== 'avatars' && doc.folder !== 'attentrack/employees');
  }, [rawDocuments]);
  const { user, isHRAdmin } = useAuth();
  const [activeFolder, setActiveFolder] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadFolder, setUploadFolder] = useState('General');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [chatDoc, setChatDoc] = useState(null);

  const isHR = isHRAdmin || user?.role === 'HR' || user?.role === 'Admin';

  const folderCounts = useMemo(() => {
    const counts = {};
    FOLDERS.forEach((f) => { counts[f] = 0; });
    if (!Array.isArray(documents)) return counts;
    counts['All'] = documents.length;
    documents.forEach((doc) => {
      const folder = doc.folder || 'General';
      if (counts.hasOwnProperty(folder)) {
        counts[folder]++;
      } else {
        counts[folder] = 1;
      }
    });
    return counts;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    let result = documents;
    if (activeFolder !== 'All') {
      result = result.filter((doc) => doc.folder === activeFolder);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          (doc.name && doc.name.toLowerCase().includes(q)) ||
          (doc.folder && doc.folder.toLowerCase().includes(q)) ||
          (doc.description && doc.description.toLowerCase().includes(q)) ||
          (doc.uploadedByName && doc.uploadedByName.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  }, [documents, activeFolder, searchQuery]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Optional: Add a sensible max file limit for Cloudinary, e.g., 25MB
      if (file.size > 25 * 1024 * 1024) {
        setUploadError(`File too large. Maximum allowed size is 25 MB.`);
        setSelectedFile(null);
        e.target.value = ''; // Reset input
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      await documentService.upload(
        selectedFile,
        uploadFolder,
        uploadDescription,
        user?.id || user?.uid || '',
        user?.name || 'Unknown'
      );
      setUploadSuccess(true);
      setSelectedFile(null);
      setUploadDescription('');
      await refreshDocuments();
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccess(false);
      }, 1200);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleView = (doc) => {
    setPreviewDoc(doc);
    setPreviewModalOpen(true);
  };

  const handleChat = (doc) => {
    setChatDoc(doc);
  };

  const handleDelete = async (id) => {
    try {
      await documentService.delete(id);
      const updated = (rawDocuments || []).filter((d) => String(d.id) !== String(id));
      setDocuments(updated);
    } catch (e) {
      console.warn('Delete failed:', e.message);
    }
  };

  const handleUploadModalClose = () => {
    if (!uploading) {
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50 relative">
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
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shrink-0"
          >
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-full pl-11 pr-4 py-3.5 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Categories Row */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 items-center no-scrollbar">
          {FOLDERS.map((folder) => (
            <CategoryCard
              key={folder}
              title={folder}
              count={folderCounts[folder] || 0}
              colorClass="bg-primary/10 text-primary dark:text-primary"
              isActive={activeFolder === folder}
              onClick={() => setActiveFolder(folder)}
            />
          ))}
        </div>

        {/* Recent Files Table */}
        <div className="card-elevated border border-border rounded-2xl bg-card overflow-hidden">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-[15px] text-card-foreground">
              {activeFolder === 'All' ? 'All Documents' : `${activeFolder}`}
            </h3>
            <span className="text-[13px] text-muted-foreground">
              {filteredDocuments.length} file{filteredDocuments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No documents found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search query' : 'Upload documents to get started'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground">Name</th>
                    <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground hidden md:table-cell">Folder</th>
                    <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground hidden sm:table-cell">Size</th>
                    <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground hidden sm:table-cell">Modified</th>
                    <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground hidden lg:table-cell">Uploaded By</th>
                    <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground text-right sm:text-left">Status</th>
                    {isHR && (
                      <th className="py-4 px-2 sm:px-6 font-medium text-[13px] text-muted-foreground text-right">View</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredDocuments.map((doc) => (
                    <FileRow 
                      key={doc.id} 
                      doc={doc} 
                      onDelete={handleDelete} 
                      onView={handleView} 
                      onChat={handleChat}
                      isHR={isHR} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Upload document</h3>
                  <p className="text-[11px] text-muted-foreground">Upload files to the document vault</p>
                </div>
              </div>
              <button
                onClick={handleUploadModalClose}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpload();
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">File</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full px-3.5 py-2.5 bg-muted/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    required
                  />
                </div>
                {selectedFile && (
                  <p className="text-[12px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Folder</label>
                <CustomSelect
                  value={uploadFolder}
                  onChange={(val) => setUploadFolder(val)}
                  options={[
                    { label: 'General', value: 'General' },
                    { label: 'Contracts', value: 'Contracts' },
                    { label: 'Payslips', value: 'Payslips' },
                    { label: 'Policies', value: 'Policies' },
                    { label: 'Certificates', value: 'Certificates' },
                    { label: 'IDs & Proofs', value: 'IDs & Proofs' },
                    { label: 'Onboarding', value: 'Onboarding' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Description (optional)</label>
                <input
                  type="text"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief description of the document"
                  className="w-full px-3.5 py-2.5 bg-muted/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
              {uploadError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {uploadError}
                </div>
              )}
              {uploadSuccess && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Document uploaded successfully!
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleUploadModalClose}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground bg-muted hover:bg-muted/70 border border-border transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewModalOpen && previewDoc && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                  {getFileIcon(previewDoc.mimeType, previewDoc.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate max-w-md">{previewDoc.name}</h3>
                  <p className="text-[11px] text-muted-foreground truncate max-w-md">
                    {previewDoc.folder} · {formatFileSize(previewDoc.size)} · {previewDoc.uploadedByName || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={previewDoc.url}
                  download={previewDoc.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => { setPreviewModalOpen(false); setPreviewDoc(null); }}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
              {previewDoc.mimeType && previewDoc.mimeType.startsWith('image/') ? (
                <div className="flex justify-center">
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.name}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              ) : previewDoc.mimeType && previewDoc.mimeType.includes('pdf') ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full h-[500px] rounded-lg"
                  style={{ minHeight: '400px' }}
                />
              ) : previewDoc.mimeType && previewDoc.mimeType.startsWith('text/') ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full h-[500px] rounded-lg font-mono text-sm"
                  style={{ minHeight: '400px' }}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">Preview not available</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    This file type cannot be previewed in the browser. Download the file to view it.
                  </p>
                  <a
                    href={previewDoc.url}
                    download={previewDoc.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download file
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <DocumentChat 
        isOpen={!!chatDoc} 
        onClose={() => setChatDoc(null)} 
        document={chatDoc} 
      />
    </main>
  );
}