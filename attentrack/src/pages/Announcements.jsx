import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Megaphone, 
  ThumbsUp, 
  MessageSquare, 
  Pin,
  Cake,
  PartyPopper,
  X,
  Send,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { announcementService } from '../services/announcementService';
import { CustomSelect } from '../components/common/CustomSelect';

const formatTimeAgo = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const AnnouncementCard = ({ 
  announcement, 
  userId, 
  onLike, 
  onOpenComments, 
  onTogglePin, 
  onDelete,
  canPinOrDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isLiked = Array.isArray(announcement.likedBy) && announcement.likedBy.includes(userId);
  const commentCount = Array.isArray(announcement.comments) ? announcement.comments.length : 0;

  return (
    <div className="card-elevated p-6 border border-border rounded-2xl bg-card transition-colors hover:border-border/80 relative">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <Megaphone className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h3 className="font-semibold text-[15px] text-card-foreground">{announcement.title}</h3>
              {announcement.isPinned && (
                <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Pinned
                </span>
              )}
            </div>
            {canPinOrDelete && (
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
                      <button
                        onClick={async () => { setShowMenu(false); await onTogglePin(announcement.id, !announcement.isPinned); }}
                        className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        {announcement.isPinned ? 'Unpin post' : 'Pin post'}
                      </button>
                      <button
                        onClick={async () => { setShowMenu(false); await onDelete(announcement.id); }}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete post
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground mb-4">
            {announcement.author || 'Company'} · {formatTimeAgo(announcement.createdAt)}
          </p>
          <p className="text-[14px] text-card-foreground leading-relaxed mb-5">
            {announcement.content || announcement.description}
          </p>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onLike(announcement.id)}
              className={`flex items-center gap-1.5 text-[13px] transition-colors group ${
                isLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 group-hover:scale-110 transition-transform ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{announcement.likes || 0}</span>
            </button>
            <button 
              onClick={() => onOpenComments(announcement)}
              className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors group"
            >
              <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{commentCount} comments</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BirthdayCard = ({ name, role, avatar, email }) => (
  <div className="flex items-center justify-between py-3 group">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-border">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
            {name?.[0]}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="font-medium text-[14px] text-card-foreground truncate">{name}</h4>
        <p className="text-[12px] text-muted-foreground truncate">{role}</p>
      </div>
    </div>
    <a 
      href={`mailto:${email || ''}?subject=Happy Birthday!&body=Happy Birthday ${name}!`}
      className="px-4 py-1.5 rounded-full border border-border text-[12px] font-medium text-foreground hover:bg-muted transition-colors bg-card shadow-sm ml-2 shrink-0 cursor-pointer"
    >
      Wish
    </a>
  </div>
);

const AnniversaryCard = ({ name, role, tenure, avatar, email }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-border">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
            {name?.[0]}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="font-medium text-[14px] text-card-foreground truncate">{name}</h4>
        <p className="text-[12px] text-muted-foreground truncate">{tenure} · {role}</p>
      </div>
    </div>
    <a 
      href={`mailto:${email || ''}?subject=Happy Work Anniversary!&body=Happy Work Anniversary ${name}! Congratulations on your milestone!`}
      className="px-4 py-1.5 rounded-full border border-border text-[12px] font-medium text-foreground hover:bg-muted transition-colors bg-card shadow-sm ml-2 shrink-0 cursor-pointer"
    >
      Wish
    </a>
  </div>
);

const PostAnnouncementModal = ({ isOpen, onClose, onPost }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Company');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
      setCategory('Company');
      setIsPinned(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await onPost({
        title: title.trim(),
        content: content.trim(),
        author: user?.name || 'Team Member',
        authorAvatar: user?.avatar,
        category,
        isPinned
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Post announcement</h3>
              <p className="text-[11px] text-muted-foreground">Share with the entire company</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 All-Hands next Friday"
              className="w-full px-3.5 py-2.5 bg-muted/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to announce?"
              rows={5}
              className="w-full px-3.5 py-2.5 bg-muted/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Category</label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val)}
                options={[
                  { label: 'Company', value: 'Company' },
                  { label: 'Policy', value: 'Policy' },
                  { label: 'Events', value: 'Events' },
                  { label: 'Product', value: 'Product' },
                  { label: 'People Ops', value: 'People Ops' },
                  { label: 'Benefits', value: 'Benefits' }
                ]}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border"
                />
                <span className="text-xs font-medium text-foreground">Pin to top</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground bg-muted hover:bg-muted/70 border border-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CommentsModal = ({ isOpen, onClose, announcement, userId, onAddComment, onDeleteComment }) => {
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();
  const comments = announcement?.comments || [];

  if (!isOpen || !announcement) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await onAddComment(announcement.id, {
      text: commentText.trim(),
      author: user?.name || 'Team Member',
      authorAvatar: user?.avatar,
      userId: userId || 'anonymous'
    });
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">{announcement.title}</h3>
              <p className="text-[11px] text-muted-foreground">{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {comments.length === 0 && (
            <div className="text-center py-10">
              <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${c.author}&backgroundColor=f1f5f9`} alt={c.author} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-medium text-sm text-foreground">{c.author}</span>
                    <span className="text-[11px] text-muted-foreground ml-2">{formatTimeAgo(c.createdAt)}</span>
                  </div>
                  {(c.userId === userId) && (
                    <button
                      onClick={() => onDeleteComment(announcement.id, c.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-card-foreground mt-1 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3.5 py-2.5 bg-muted/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default function Announcements() {
  const { announcements, todaysBirthdays, workAnniversaries, refreshAnnouncements, setAnnouncements } = useDataContext();
  const { user, isHRAdmin } = useAuth();
  const userId = user?.id || user?.uid || user?.email || 'guest';

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [commentsModalData, setCommentsModalData] = useState(null);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.autoOpenQuickAdd) {
      setPostModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const sortedAnnouncements = useMemo(() => {
    if (!Array.isArray(announcements)) return [];
    return [...announcements].sort((a, b) => {
      if (!!b.isPinned !== !!a.isPinned) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  }, [announcements]);

  const handleLike = async (id) => {
    const current = announcements.find(a => String(a.id) === String(id));
    if (!current) return;
    const wasLiked = Array.isArray(current.likedBy) && current.likedBy.includes(userId);
    const optimistic = announcements.map(a => {
      if (String(a.id) !== String(id)) return a;
      const likedBy = Array.isArray(a.likedBy) ? [...a.likedBy] : [];
      const newLikedBy = wasLiked ? likedBy.filter(u => u !== userId) : [...likedBy, userId];
      return { ...a, likes: (a.likes || 0) + (wasLiked ? -1 : 1), likedBy: newLikedBy };
    });
    setAnnouncements(optimistic);
    try {
      await announcementService.toggleLike(id, userId);
    } catch (e) {
      console.warn('Like failed:', e.message);
      await refreshAnnouncements();
    }
  };

  const handlePost = async (payload) => {
    try {
      await announcementService.create(payload);
      await refreshAnnouncements();
    } catch (e) {
      console.warn('Post failed:', e.message);
      throw e;
    }
  };

  const handleAddComment = async (id, commentData) => {
    try {
      await announcementService.addComment(id, commentData);
      await refreshAnnouncements();
      const refreshed = await announcementService.getById(id);
      if (refreshed?.data) setCommentsModalData(refreshed.data);
    } catch (e) {
      console.warn('Comment failed:', e.message);
    }
  };

  const handleDeleteComment = async (id, commentId) => {
    try {
      await announcementService.deleteComment(id, commentId);
      await refreshAnnouncements();
      const refreshed = await announcementService.getById(id);
      if (refreshed?.data) setCommentsModalData(refreshed.data);
    } catch (e) {
      console.warn('Delete comment failed:', e.message);
    }
  };

  const handleTogglePin = async (id, isPinned) => {
    try {
      await announcementService.togglePin(id, isPinned);
      await refreshAnnouncements();
    } catch (e) {
      console.warn('Pin failed:', e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await announcementService.delete(id);
      await refreshAnnouncements();
    } catch (e) {
      console.warn('Delete failed:', e.message);
    }
  };

  const displayBirthdays = todaysBirthdays && todaysBirthdays.length > 0
    ? todaysBirthdays
    : [];

  const displayAnniversaries = workAnniversaries && workAnniversaries.length > 0
    ? workAnniversaries
    : [];

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        
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
          <button 
            onClick={() => setPostModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Megaphone className="w-4 h-4" />
            Post announcement
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-4">
            {sortedAnnouncements.length === 0 ? (
              <div className="card-elevated p-12 border border-border rounded-2xl bg-card text-center">
                <Megaphone className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No announcements yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Be the first to share something with the company.</p>
                <button 
                  onClick={() => setPostModalOpen(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Create first announcement
                </button>
              </div>
            ) : (
              sortedAnnouncements.map((ann) => (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  userId={userId}
                  onLike={handleLike}
                  onOpenComments={setCommentsModalData}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                  canPinOrDelete={isHRAdmin}
                />
              ))
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            
            <div className="card-elevated p-6 border border-border rounded-2xl bg-card">
              <div className="flex items-center gap-2 mb-4">
                <Cake className="w-4.5 h-4.5 text-amber-500" />
                <h3 className="font-semibold text-[15px] text-card-foreground">Today's birthdays</h3>
              </div>
              {displayBirthdays.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {displayBirthdays.map((b, i) => (
                    <BirthdayCard key={`${b.id || b.name}-${i}`} name={b.name} role={b.role} avatar={b.avatar} email={b.email} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-muted-foreground">
                  <p className="text-xs font-medium text-foreground">No birthdays today</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Add birthday dates to employee profiles</p>
                </div>
              )}
            </div>

            <div className="card-elevated p-6 border border-border rounded-2xl bg-card">
              <div className="flex items-center gap-2 mb-4">
                <PartyPopper className="w-4.5 h-4.5 text-sky-500" />
                <h3 className="font-semibold text-[15px] text-card-foreground">Work anniversaries</h3>
              </div>
              {displayAnniversaries.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {displayAnniversaries.map((a, i) => (
                    <AnniversaryCard key={`${a.id || a.name}-${i}`} name={a.name} tenure={a.tenure} role={a.role} avatar={a.avatar} email={a.email} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-muted-foreground">
                  <p className="text-xs font-medium text-foreground">No anniversaries this week</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Add join dates to employee profiles</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      <PostAnnouncementModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onPost={handlePost}
      />

      <CommentsModal
        isOpen={!!commentsModalData}
        announcement={commentsModalData}
        userId={userId}
        onClose={() => setCommentsModalData(null)}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />
    </main>
  );
}
