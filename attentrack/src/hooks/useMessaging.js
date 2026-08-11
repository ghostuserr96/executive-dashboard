import { useState, useCallback } from 'react';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { usePresence } from '../hooks/usePresence';
import { useAuth } from '../context/AuthContext';

export const useMessaging = () => {
  const { user } = useAuth();
  const conversations = useConversations();
  const messages = useMessages(conversations.activeChannel?.id);
  const presence = usePresence();

  const [globalError, setGlobalError] = useState(null);

  const selectChannel = useCallback(
    (channel) => {
      conversations.selectChannel(channel);
    },
    [conversations]
  );

  const sendMessage = useCallback(
    async (text, attachments) => {
      if (!conversations.activeChannel?.id) return false;
      const success = await messages.sendMessage(text, attachments || []);
      return success;
    },
    [conversations.activeChannel?.id, messages.sendMessage]
  );

  const clearError = useCallback(() => {
    setGlobalError(null);
    messages.clearError();
  }, [messages.clearError]);

  const setTyping = useCallback(
    (isTyping) => {
      if (conversations.activeChannel?.id) {
        presence.setTyping(conversations.activeChannel.id, isTyping);
      }
    },
    [conversations.activeChannel?.id, presence.setTyping]
  );

  const scheduleTypingStop = useCallback(
    () => {
      if (conversations.activeChannel?.id) {
        presence.scheduleTypingStop(conversations.activeChannel.id);
      }
    },
    [conversations.activeChannel?.id, presence.scheduleTypingStop]
  );

  return {
    channels: conversations.conversations,
    channelsList: conversations.channelsList,
    dmsList: conversations.dmsList,
    selectedChannel: conversations.activeChannel,
    messages: messages.messages,
    loading: conversations.loading || messages.loading,
    error: globalError || messages.error,
    sending: messages.sending,
    hasMore: messages.hasMore,
    typingUsers: presence.typingUsers,
    searchTerm: conversations.searchTerm,
    searchResults: conversations.searchResults,
    selectChannel,
    sendMessage,
    loadMore: messages.loadMore,
    clearError,
    setTyping,
    scheduleTypingStop,
    getUnreadCount: conversations.getUnreadCount,
    getLatestMessagePreview: conversations.getLatestMessagePreview,
    getLatestMessageTime: conversations.getLatestMessageTime,
    createDM: conversations.createDM,
    createChannel: conversations.createChannel,
    isUserOnline: presence.isUserOnline,
  };
};