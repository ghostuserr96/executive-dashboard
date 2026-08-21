import React, { useState, useRef, useEffect } from 'react';
import {
  Hash,
  Plus,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Paperclip,
  Image,
  FileText,
  X,
} from 'lucide-react';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { usePresence } from '../hooks/usePresence';
import { useAuth } from '../context/AuthContext';
import { useDataContext } from '../context/DataContext';
import { formatTimestamp, getAvatarUrl, isImageFile, isAttachmentSupported, getFileCategory } from '../utils/chatHelpers';

export const getDisplayName = (channel, currentUser) => {
  if (!channel) return '';
  if (channel.type === 'dm' && channel.name && channel.name.includes(', ')) {
    return channel.name.split(', ').filter(n => n !== currentUser?.name).join(', ') || channel.name;
  }
  return channel.name;
};

const ChannelItem = ({ channel, isActive, onClick, unreadCount }) => (
  <button
    onClick={() => onClick(channel)}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
  >
    <div className="flex items-center gap-2">
      <Hash className="w-4 h-4 opacity-70" />
      <span className="truncate">{channel.name}</span>
    </div>
    {unreadCount > 0 && (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
        {unreadCount}
      </span>
    )}
  </button>
);

const DMItem = ({ channel, isActive, onClick, unreadCount, isOnline, currentUser, otherUserAvatar }) => {
  const displayName = getDisplayName(channel, currentUser);
  const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  
  return (
    <button
      onClick={() => onClick(channel)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
    >
      <div className="relative shrink-0">
        {otherUserAvatar ? (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border/50 bg-muted">
            <img
              src={otherUserAvatar}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
            {initials}
          </div>
        )}
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
      </div>
      <span className="truncate flex-1 text-left font-medium">{displayName}</span>
      {unreadCount > 0 && (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

const ChatMessage = ({ message, currentUserId, senderAvatar }) => {
  const isOwn = message.senderId === currentUserId;
  const time = formatTimestamp(message.createdAt);
  const initials = message.senderName ? message.senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {senderAvatar ? (
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 mt-1 border border-border/50 bg-muted">
          <img
            src={senderAvatar}
            alt={message.senderName}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-1 border border-primary/20">
          {initials}
        </div>
      )}
      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
        <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
          <h4 className="font-semibold text-[14px] text-card-foreground">
            {message.senderName}
          </h4>
          <span className="text-[12px] text-muted-foreground">
            {time}
          </span>
        </div>
        <p className="text-[14px] text-card-foreground leading-relaxed">
          {message.text}
        </p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((att, idx) => {
              const category = getFileCategory(att.name, att.type);
              return (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-[12px] text-muted-foreground ${isOwn ? 'ml-auto' : ''}`}
                >
                  {category === 'image' ? (
                    <Image className="w-3 h-3" />
                  ) : category === 'pdf' ? (
                    <FileText className="w-3 h-3" />
                  ) : (
                    <FileText className="w-3 h-3" />
                  )}
                  <span className="truncate max-w-50">{att.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) return null;
  const names = typingUsers.map((t) => t.userName).join(', ');
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-[12px] text-muted-foreground">
      <Loader2 className="w-3 h-3 animate-spin" />
      <span>{names} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-[14px]">Loading messages...</span>
    </div>
  </div>
);

const EmptyState = ({ channelName }) => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <Hash className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
      <p className="text-[14px] text-muted-foreground">
        {channelName
          ? `No messages in #${channelName} yet. Start the conversation!`
          : 'Select a channel or DM to start messaging'}
      </p>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
      <p className="text-[14px] text-muted-foreground mb-3">
        {message || 'Failed to load messages'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-[13px] font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  </div>
);

const AttachmentPreview = ({ file, onRemove }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-[12px]">
    {isImageFile(file.name, file.type) ? (
      <Image className="w-4 h-4 text-muted-foreground" />
    ) : (
      <FileText className="w-4 h-4 text-muted-foreground" />
    )}
    <span className="truncate max-w-37.5 text-foreground">{file.name}</span>
    <button
      onClick={() => onRemove(file.name)}
      className="text-muted-foreground hover:text-foreground"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

export default function Messaging() {
  const {
    channelsList,
    dmsList,
    activeChannel,
    loading,
    error,
    searchTerm,
    searchResults,
    selectChannel,
    search,
    getUnreadCount,
    getLatestMessagePreview,
    getLatestMessageTime,
    createDM,
    createChannel,
  } = useConversations();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sending,
    sendMessage,
    clearError,
    messagesEndRef,
  } = useMessages(activeChannel?.id);

  const {
    typingUsers,
    setTyping,
    scheduleTypingStop,
    subscribeChannelTyping,
    isUserOnline,
  } = usePresence();

  const { user } = useAuth();
  const { employees } = useDataContext();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false); // 'channel' | 'dm' | false
  const [newChatName, setNewChatName] = useState('');
  const [newChatSearch, setNewChatSearch] = useState('');
  const [newChatLoading, setNewChatLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (activeChannel?.id) {
      const unsub = subscribeChannelTyping(activeChannel.id);
      return () => {
        if (unsub) unsub();
      };
    }
  }, [activeChannel?.id, subscribeChannelTyping]);

  const handleSend = async () => {
    if ((!inputText.trim() && attachments.length === 0) || !activeChannel) return;

    const success = await sendMessage(inputText, attachments);
    if (success) {
      setInputText('');
      setAttachments([]);
      setShowAttachmentMenu(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleRetry = () => {
    clearError();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) =>
      isAttachmentSupported(f.name, f.type)
    );
    setAttachments((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (fileName) => {
    setAttachments((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    search(value);
  };

  const handleCreateChat = async (selectedUser = null) => {
    setNewChatLoading(true);
    try {
      if (isNewChatOpen === 'dm' && selectedUser) {
        const userId = user?.id ? String(user.id) : user?.email;
        const otherId = String(selectedUser.id);
        const res = await createDM([userId, otherId], `${user?.name}, ${selectedUser.name}`);
        selectChannel({ id: res.id, type: 'dm', name: selectedUser.name });
        setIsNewChatOpen(false);
      } else if (isNewChatOpen === 'channel' && newChatName.trim()) {
        const userId = user?.id ? String(user.id) : user?.email;
        const res = await createChannel(newChatName.trim(), 'channel', [userId]);
        selectChannel({ id: res.id, type: 'channel', name: newChatName.trim() });
        setIsNewChatOpen(false);
        setNewChatName('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setNewChatLoading(false);
    }
  };

  const displayConversations = searchTerm.length > 0 ? searchResults : channelsList;
  const displayDMs = searchTerm.length > 0 ? [] : dmsList;

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
          <div className="w-64 shrink-0 border-r border-border flex-col overflow-y-auto p-4 hidden md:flex space-y-8">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Channels Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Channels</h3>
                <button onClick={() => setIsNewChatOpen('channel')} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-0.5">
                {loading ? (
                  <div className="px-2 py-2 text-[14px] text-muted-foreground">Loading channels...</div>
                ) : displayConversations.length === 0 ? (
                  <div className="px-2 py-2 text-[14px] text-muted-foreground">No channels yet</div>
                ) : (
                  displayConversations.map((channel) => (
                    <ChannelItem
                      key={channel.id}
                      channel={channel}
                      isActive={activeChannel?.id === channel.id}
                      onClick={selectChannel}
                      unreadCount={getUnreadCount(channel)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* DMs Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Direct Messages</h3>
                <button onClick={() => setIsNewChatOpen('dm')} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {loading ? (
                  <div className="px-2 py-2 text-[14px] text-muted-foreground">Loading conversations...</div>
                ) : displayDMs.length === 0 ? (
                  <div className="px-2 py-2 text-[14px] text-muted-foreground">No direct messages yet</div>
                ) : (
                  displayDMs.map((dm) => {
                    const currentIdStr = user?.id ? String(user.id) : (user?.email || '');
                    const displayName = getDisplayName(dm, user);
                    const membersList = Array.isArray(dm.members) ? dm.members : (Array.isArray(dm.participants) ? dm.participants : []);
                    const otherUserId = membersList.find((p) => String(p) !== currentIdStr);

                    const otherEmployee = employees?.find(e => 
                      String(e.id) === String(otherUserId) || 
                      (e.email && String(e.email).toLowerCase() === String(otherUserId).toLowerCase()) ||
                      (e.name && String(e.name).trim().toLowerCase() === String(displayName).trim().toLowerCase())
                    );

                    return (
                      <DMItem
                        key={dm.id}
                        channel={dm}
                        currentUser={user}
                        otherUserAvatar={otherEmployee?.avatar}
                        isActive={activeChannel?.id === dm.id}
                        onClick={selectChannel}
                        unreadCount={getUnreadCount(dm)}
                        isOnline={otherUserId ? isUserOnline(otherUserId) : false}
                      />
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Chat Header */}
            {activeChannel ? (
              <div className="px-6 py-4 border-b border-border bg-card shrink-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-semibold text-[16px] text-card-foreground leading-tight">
                    {getDisplayName(activeChannel, user)}
                  </h2>
                </div>
                <p className="text-[13px] text-muted-foreground pl-7">
                  {activeChannel.type === 'dm' ? 'Direct message' : `${activeChannel.members?.length || 0} members`}
                  {activeChannel.description ? ` · ${activeChannel.description}` : ''}
                </p>
              </div>
            ) : null}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messagesError && !activeChannel ? (
                <ErrorState message={messagesError} onRetry={handleRetry} />
              ) : messagesLoading ? (
                <LoadingState />
              ) : !activeChannel ? (
                <EmptyState channelName={null} />
              ) : messages.length === 0 ? (
                <EmptyState channelName={getDisplayName(activeChannel, user)} />
              ) : (
                messages.map((msg) => {
                  const isCurrentUser = String(msg.senderId) === String(user?.id) || msg.senderId === user?.email || (msg.senderName && String(msg.senderName).trim().toLowerCase() === String(user?.name).trim().toLowerCase());
                  const senderEmp = employees?.find(e => 
                    String(e.id) === String(msg.senderId) || 
                    (e.email && String(e.email).toLowerCase() === String(msg.senderId).toLowerCase()) || 
                    (e.name && String(e.name).trim().toLowerCase() === String(msg.senderName).trim().toLowerCase())
                  );
                  const avatarToUse = isCurrentUser ? (user?.avatar || user?.photoURL || senderEmp?.avatar) : senderEmp?.avatar;
                  
                  return (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      currentUserId={user?.id ? String(user.id) : user?.email}
                      senderAvatar={avatarToUse}
                    />
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {activeChannel && (
              <TypingIndicator typingUsers={typingUsers} />
            )}

            {/* Input Area */}
            {activeChannel ? (
              <div className="p-4 shrink-0 bg-card border-t border-border">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachments.map((file) => (
                      <AttachmentPreview
                        key={file.name}
                        file={file}
                        onRemove={handleRemoveAttachment}
                      />
                    ))}
                  </div>
                )}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder={`Message #${getDisplayName(activeChannel, user)}`}
                    value={inputText}
                    onChange={(e) => {
                      handleInputChange(e);
                      setTyping(true);
                      scheduleTypingStop();
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    className="w-full bg-background border border-border rounded-full pl-5 pr-12 py-3 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || (!inputText.trim() && attachments.length === 0)}
                    className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 shrink-0 bg-card border-t border-border">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Select a channel or DM to start messaging"
                    disabled
                    className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-3 text-[14px] text-muted-foreground focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setIsNewChatOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-foreground mb-4">
              {isNewChatOpen === 'channel' ? 'Create a New Channel' : 'Start a Direct Message'}
            </h2>

            {isNewChatOpen === 'channel' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Channel Name</label>
                  <input
                    type="text"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    placeholder="e.g. general, engineering"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsNewChatOpen(false)} className="px-4 py-2 text-xs border border-border text-foreground rounded-xl hover:bg-muted">Cancel</button>
                  <button type="button" onClick={() => handleCreateChat()} disabled={newChatLoading || !newChatName.trim()} className="px-4 py-2 text-xs bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50">
                    {newChatLoading ? 'Creating...' : 'Create Channel'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    placeholder="Search employees..."
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                  {employees
                    .filter(e => e.id !== user?.id && e.email !== user?.email)
                    .filter(e => e.name?.toLowerCase().includes(newChatSearch.toLowerCase()) || e.email?.toLowerCase().includes(newChatSearch.toLowerCase()))
                    .map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => handleCreateChat(emp)}
                        disabled={newChatLoading}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-left transition-colors disabled:opacity-50"
                      >
                        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0">
                          {emp.avatar ? (
                            <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-foreground">
                              {emp.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{emp.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{emp.role || emp.email}</div>
                        </div>
                      </button>
                    ))}
                  {employees.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">No other employees found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}