import { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

export const useMessages = (channelId) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const isMountedRef = useRef(true);
  const channelIdRef = useRef(channelId);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    channelIdRef.current = channelId;
  }, [channelId]);

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!channelId) {
      setMessages([]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      unsubscribeRef.current = chatService.subscribeMessages(
        channelId,
        (data, newLastDoc) => {
          if (!isMountedRef.current) return;
          setMessages(data);
          setLastDoc(newLastDoc);
          setHasMore(data.length >= 50);
          setLoading(false);
        },
        { limit: 50 }
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
  }, [channelId]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom(false);
    }
  }, [loading, messages.length, scrollToBottom]);

  const sendMessage = useCallback(
    async (text, attachments = []) => {
      if (!channelId || !text.trim() || !user) {
        return false;
      }

      const trimmedText = text.trim();
      const senderId = user.id ? String(user.id) : user.email;
      const senderName = user.name || user.email;

      setSending(true);

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        text: trimmedText,
        senderId,
        senderName,
        createdAt: new Date(),
        readBy: [senderId],
        attachments: [],
        _optimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      scrollToBottom(false);

      try {
        const docRef = await chatService.sendMessage(
          channelId,
          trimmedText,
          senderId,
          senderName,
          attachments
        );

        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, id: docRef.id, _optimistic: false } : m
          )
        );

        await chatService.updateChannelLastMessage(
          channelId,
          trimmedText,
          user.id ? String(user.id) : user.email,
          user.name || 'User'
        );

        setSending(false);
        return true;
      } catch (err) {
        setError(err.message);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setSending(false);
        return false;
      }
    },
    [channelId, user, scrollToBottom]
  );

  const loadMore = useCallback(async () => {
    if (!channelId || !hasMore || loading) return;
    try {
      const olderMessages = await new Promise((resolve, reject) => {
        const unsub = chatService.subscribeMessages(
          channelId,
          (data) => {
            unsub();
            resolve(data);
          },
          { lastDoc, limit: 50 }
        );
      });
      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev]);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Failed to load more messages:', err.message);
    }
  }, [channelId, hasMore, loading, lastDoc]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sending,
    hasMore,
    sendMessage,
    loadMore,
    clearError,
    scrollToBottom,
    messagesEndRef,
  };
};