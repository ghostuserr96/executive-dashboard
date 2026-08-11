import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const HEARTBEAT_INTERVAL = 30000;
const TYPING_TIMEOUT = 3000;
const OFFLINE_THRESHOLD_MS = 60000;

export const usePresence = () => {
  const { user } = useAuth();
  const [presenceMap, setPresenceMap] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const heartbeatRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const channelIdRef = useRef(null);

  const userId = user?.id ? String(user.id) : user?.email;
  const userName = user?.name || user?.email;
  const userEmail = user?.email;

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) return;
    heartbeatRef.current = setInterval(() => {
      if (userId && userName) {
        chatService.setPresence(userId, userName, userEmail, 'online');
      }
    }, HEARTBEAT_INTERVAL);
  }, [userId, userName, userEmail]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const setTyping = useCallback(
    (channelId, typing) => {
      if (!channelId || !userId) return;
      channelIdRef.current = channelId;
      if (typing && !isTypingRef.current) {
        isTypingRef.current = true;
        chatService.setTyping(channelId, userId, userName, true);
      } else if (!typing && isTypingRef.current) {
        isTypingRef.current = false;
        chatService.setTyping(channelId, userId, userName, false);
      }
    },
    [userId, userName]
  );

  const scheduleTypingStop = useCallback((channelId) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && channelIdRef.current === channelId) {
        isTypingRef.current = false;
        chatService.setTyping(channelId, userId, userName, false);
      }
    }, TYPING_TIMEOUT);
  }, [userId, userName]);

  useEffect(() => {
    if (!user) return;

    setIsOnline(true);
    chatService.setPresence(userId, userName, userEmail, 'online');
    startHeartbeat();

    const handleOnline = () => {
      setIsOnline(true);
      chatService.setPresence(userId, userName, userEmail, 'online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      chatService.setPresence(userId, userName, userEmail, 'offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopHeartbeat();
      chatService.setPresence(userId, userName, userEmail, 'offline');
    };
  }, [user, userId, userName, userEmail, startHeartbeat, stopHeartbeat]);

  useEffect(() => {
    if (!user) return;

    const unsubPresence = chatService.subscribePresence((data) => {
      setPresenceMap(data);
    });

    return () => {
      unsubPresence();
    };
  }, [user]);

  const subscribeChannelTyping = useCallback((channelId) => {
    if (!channelId) return null;
    channelIdRef.current = channelId;

    return chatService.subscribeTyping(channelId, (typingData) => {
      const filtered = typingData.filter((t) => t.userId !== userId);
      setTypingUsers(filtered);
    });
  }, [userId]);

  const getPresenceStatus = useCallback(
    (targetUserId) => {
      const presence = presenceMap[targetUserId];
      if (!presence) return { status: 'offline', lastSeen: null };
      const status = presence.status || 'offline';
      const lastSeen = presence.lastSeen
        ? presence.lastSeen.toDate?.() || new Date(presence.lastSeen)
        : null;
      return { status, lastSeen };
    },
    [presenceMap]
  );

  const isUserOnline = useCallback(
    (targetUserId) => {
      const presence = presenceMap[targetUserId];
      if (!presence) return false;
      if (presence.status === 'online') return true;
      if (presence.status === 'offline') return false;
      const lastSeen = presence.lastSeen
        ? presence.lastSeen.toDate?.()?.getTime() || 0
        : 0;
      return Date.now() - lastSeen < OFFLINE_THRESHOLD_MS;
    },
    [presenceMap]
  );

  const getLastSeen = useCallback(
    (targetUserId) => {
      const presence = presenceMap[targetUserId];
      if (!presence || !presence.lastSeen) return null;
      return presence.lastSeen.toDate?.() || new Date(presence.lastSeen);
    },
    [presenceMap]
  );

  return {
    presenceMap,
    typingUsers,
    isOnline,
    setTyping,
    scheduleTypingStop,
    subscribeChannelTyping,
    getPresenceStatus,
    isUserOnline,
    getLastSeen,
  };
};