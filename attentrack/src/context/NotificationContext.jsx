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

    const currentIdStr = user?.id ? String(user.id) : user?.email;

    const unsubscribe = chatService.subscribeChannels((data) => {
      if (initialLoadRef.current) {
        // Just populate the times so we don't notify for old messages
        data.forEach(channel => {
          lastMessageTimesRef.current[channel.id] = channel.lastMessageAt || 0;
        });
        initialLoadRef.current = false;
        return;
      }

      data.forEach(channel => {
        const isParticipant = channel.type === 'dm'
          ? channel.participants?.includes(currentIdStr)
          : channel.members?.includes(currentIdStr);

        if (!isParticipant) return;

        const prevTime = lastMessageTimesRef.current[channel.id] || 0;
        const newTime = channel.lastMessageAt || 0;

        if (newTime > prevTime && channel.lastMessageSenderId && channel.lastMessageSenderId !== currentIdStr) {
          // Add real notification for new incoming message
          const notif = {
            id: `msg_${channel.id}_${newTime}`,
            title: `New Message from ${channel.lastMessageSenderName}`,
            message: channel.lastMessage,
            time: 'Just now',
            path: '/messaging',
            unread: true
          };
          
          setNotifications(prev => {
            // Prevent duplicate notifications
            if (prev.some(n => n.id === notif.id)) return prev;
            return [notif, ...prev];
          });
          
          lastMessageTimesRef.current[channel.id] = newTime;
        }
      });
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

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
