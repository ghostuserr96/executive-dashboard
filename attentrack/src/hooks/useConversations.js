import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const unsubscribeRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      unsubscribeRef.current = chatService.subscribeChannels(
        (data) => {
          if (!isMountedRef.current) return;
          const sorted = data.sort((a, b) => {
            const aTime = a.lastMessageAt?.toDate?.()?.getTime() || 0;
            const bTime = b.lastMessageAt?.toDate?.()?.getTime() || 0;
            return bTime - aTime;
          });
          setConversations(sorted);
          setLoading(false);
        }
      );
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
        setLoading(false);
      }
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user]);

  const selectChannel = useCallback((channel) => {
    setActiveChannelId(channel.id);
    if (channel.id) {
      chatService.markChannelAsRead(channel.id, user?.id || user?.email);
    }
  }, [user]);

  const search = useCallback(async (term) => {
    setSearchTerm(term);
    if (!term || term.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await chatService.searchConversations(
        user?.id || user?.email,
        term
      );
      setSearchResults(results);
    } catch (err) {
      console.warn('Search failed:', err.message);
      setSearchResults([]);
    }
  }, [user]);

  const getUnreadCount = useCallback((channel) => {
    if (!channel || !user) return 0;
    const userId = user.id || user.email;
    const lastReadBy = channel.lastReadBy || {};
    const isRead = Array.isArray(lastReadBy) ? lastReadBy.includes(userId) : !!lastReadBy[userId];
    if (isRead) return 0;
    const lastMessageAt = channel.lastMessageAt?.toDate?.()?.getTime() || 0;
    const lastReadAt = channel.lastReadAt?._seconds
      ? channel.lastReadAt._seconds * 1000
      : 0;
    if (lastMessageAt > lastReadAt) return 1;
    return 0;
  }, [user]);

  const getLatestMessagePreview = useCallback((channel) => {
    if (!channel.lastMessage) return 'No messages yet';
    if (channel.lastMessage.length > 40) {
      return channel.lastMessage.substring(0, 40) + '...';
    }
    return channel.lastMessage;
  }, []);

  const getLatestMessageTime = useCallback((channel) => {
    if (!channel.lastMessageAt) return '';
    const date = channel.lastMessageAt.toDate
      ? channel.lastMessageAt.toDate()
      : new Date(channel.lastMessageAt);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const channelsList = conversations.filter((c) => c.type === 'channel');
  const dmsList = conversations.filter((c) => c.type === 'dm');

  const activeChannel = conversations.find(
    (c) => c.id === activeChannelId
  );

  return {
    conversations,
    channelsList,
    dmsList,
    activeChannel,
    activeChannelId,
    loading,
    error,
    searchTerm,
    searchResults,
    selectChannel,
    search,
    getUnreadCount,
    getLatestMessagePreview,
    getLatestMessageTime,
    createDM: chatService.createDM,
    createChannel: chatService.createChannel,
  };
};