import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { chatService } from '../services/chatService';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  
  const lastMessageTimesRef = useRef({});
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!user) {
      initialLoadRef.current = true;
      return;
    }

    const currentIdStr = user?.id ? String(user.id) : (user?.email || '');
    const currentNameStr = user?.name || user?.email || '';

    const unsubscribe = chatService.subscribeChannels((data) => {
      let unreadMsgNotifications = [];

      data.forEach(channel => {
        const membersList = Array.isArray(channel.members) ? channel.members.map(String) : [];
        const participantsList = Array.isArray(channel.participants) ? channel.participants.map(String) : [];
        
        const isParticipant = membersList.includes(currentIdStr) || 
                              participantsList.includes(currentIdStr) ||
                              (channel.name && channel.name.includes(currentNameStr));

        if (!isParticipant) return;

        const prevTime = lastMessageTimesRef.current[channel.id] || 0;
        const newTime = channel.lastMessageAt || 0;
        const senderId = channel.lastMessageSenderId ? String(channel.lastMessageSenderId) : '';

        if (senderId && senderId !== currentIdStr && channel.lastMessage) {
          if (initialLoadRef.current || newTime > prevTime) {
            const notif = {
              id: `msg_${channel.id}_${newTime}`,
              title: `Message from ${channel.lastMessageSenderName || 'Team'}`,
              message: channel.lastMessage,
              time: 'Recent',
              path: '/messaging',
              unread: true
            };
            unreadMsgNotifications.push(notif);
            lastMessageTimesRef.current[channel.id] = newTime;
          }
        }
      });

      if (unreadMsgNotifications.length > 0) {
        setNotifications(prev => {
          const combined = [...unreadMsgNotifications];
          prev.forEach(p => {
            if (!combined.some(c => c.id === p.id)) {
              combined.push(p);
            }
          });
          return combined;
        });
      }

      initialLoadRef.current = false;
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const addNotification = (notification) => {
    setNotifications((prev) => [
      { id: Date.now(), time: 'Just now', unread: true, ...notification },
      ...prev,
    ]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearMessagingNotifications = () => {
    setNotifications((prev) => prev.filter((n) => n.path !== '/messaging' && !String(n.id).startsWith('msg_')));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearMessagingNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
