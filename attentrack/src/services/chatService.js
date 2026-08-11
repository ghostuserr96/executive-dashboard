import { rtdb, storage, auth } from '../firebase';
import {
  ref,
  onValue,
  push,
  set,
  update,
  get,
  query,
  orderByChild,
  equalTo,
  serverTimestamp,
  remove,
  limitToLast
} from 'firebase/database';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from 'firebase/storage';

const CHANNELS_PATH = 'channels';
const MESSAGES_PATH = 'messages';
const PRESENCE_PATH = 'presence';
const TYPING_PATH = 'typing';

export const chatService = {
  subscribeChannels: (callback, { type, limit: queryLimit } = {}) => {
    let channelsRef = ref(rtdb, CHANNELS_PATH);
    let q = channelsRef;
    
    // In RTDB, if we want to filter by type, we can't also orderByChild('lastMessageAt') in the same query natively without complex indexing.
    // For simplicity, we fetch all channels the user is in (or filter locally).
    // Let's use simple fetching and local sorting/filtering.
    
    return onValue(q, (snapshot) => {
      const channels = [];
      snapshot.forEach((childSnapshot) => {
        channels.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      
      let filtered = channels;
      if (type) {
        filtered = filtered.filter(c => c.type === type);
      }
      
      // Sort by lastMessageAt descending
      filtered.sort((a, b) => {
        const timeA = a.lastMessageAt || 0;
        const timeB = b.lastMessageAt || 0;
        return timeB - timeA;
      });
      
      if (queryLimit) {
        filtered = filtered.slice(0, queryLimit);
      }
      
      callback(filtered);
    });
  },

  subscribeMessages: (channelId, callback, { limit: queryLimit = 50 } = {}) => {
    const messagesRef = query(
      ref(rtdb, `${MESSAGES_PATH}/${channelId}`),
      orderByChild('createdAt'),
      limitToLast(queryLimit)
    );
    
    return onValue(messagesRef, (snapshot) => {
      const messages = [];
      snapshot.forEach((childSnapshot) => {
        messages.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      
      // RTDB limitToLast with orderBy returns ascending.
      // We want descending order for the messages UI since lastMessage is at the top/bottom depending on UI.
      // Wait, Firestore was orderBy('createdAt', 'desc').
      messages.reverse();
      callback(messages, null);
    });
  },

  subscribeMessagesAscending: (channelId, callback, { limit: queryLimit = 50 } = {}) => {
    const messagesRef = query(
      ref(rtdb, `${MESSAGES_PATH}/${channelId}`),
      orderByChild('createdAt'),
      limitToLast(queryLimit)
    );
    
    return onValue(messagesRef, (snapshot) => {
      const messages = [];
      snapshot.forEach((childSnapshot) => {
        messages.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      callback(messages, null);
    });
  },

  sendMessage: async (channelId, text, senderId, senderName, attachments = []) => {
    if (!text || !text.trim()) {
      throw new Error('Message text cannot be empty');
    }
    const messagesListRef = ref(rtdb, `${MESSAGES_PATH}/${channelId}`);
    const newMessageRef = push(messagesListRef);
    
    const messageData = {
      text: text.trim(),
      senderId,
      senderName,
      createdAt: serverTimestamp(),
      readBy: { [senderId]: true },
      attachments: attachments.map((a) => ({
        id: a.id,
        name: a.name,
        url: a.url,
        size: a.size,
        type: a.type,
        thumbnailUrl: a.thumbnailUrl || null,
      })),
    };
    
    await set(newMessageRef, messageData);
    return { id: newMessageRef.key };
  },

  sendMessageBatch: async (channelId, messages) => {
    if (!messages.length) return [];
    const updates = {};
    const ids = [];
    
    messages.forEach((msg) => {
      const newKey = push(ref(rtdb, `${MESSAGES_PATH}/${channelId}`)).key;
      ids.push({ id: newKey });
      updates[`${MESSAGES_PATH}/${channelId}/${newKey}`] = {
        text: msg.text.trim(),
        senderId: msg.senderId,
        senderName: msg.senderName,
        createdAt: serverTimestamp(),
        readBy: { [msg.senderId]: true },
        attachments: (msg.attachments || []).map((a) => ({
          id: a.id,
          name: a.name,
          url: a.url,
          size: a.size,
          type: a.type,
          thumbnailUrl: a.thumbnailUrl || null,
        })),
      };
    });
    
    await update(ref(rtdb), updates);
    return ids;
  },

  updateChannelLastMessage: async (channelId, lastMessage, lastMessageSenderId, lastMessageSenderName, lastMessageAt) => {
    await update(ref(rtdb, `${CHANNELS_PATH}/${channelId}`), {
      lastMessage,
      lastMessageSenderId: lastMessageSenderId || null,
      lastMessageSenderName: lastMessageSenderName || null,
      lastMessageAt: lastMessageAt || serverTimestamp(),
    });
  },

  updateChannelMembers: async (channelId, members) => {
    await update(ref(rtdb, `${CHANNELS_PATH}/${channelId}`), { members });
  },

  createChannel: async (name, type = 'channel', members = [], description = '') => {
    const channelsRef = ref(rtdb, CHANNELS_PATH);
    const newChannelRef = push(channelsRef);
    
    const channelData = {
      name,
      type,
      members,
      description,
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
    };
    
    await set(newChannelRef, channelData);
    return { id: newChannelRef.key };
  },

  createDM: async (participants, name) => {
    // We need to check if a DM already exists.
    const channelsRef = query(ref(rtdb, CHANNELS_PATH), orderByChild('type'), equalTo('dm'));
    const snapshot = await get(channelsRef);
    
    if (snapshot.exists() && participants.length === 2) {
      const channels = snapshot.val();
      for (const [key, data] of Object.entries(channels)) {
        if (data.members && data.members.includes(participants[0]) && data.members.includes(participants[1]) && data.members.length === 2) {
          return { id: key, ...data };
        }
      }
    }

    const dmData = {
      name: name || participants.join(', '),
      type: 'dm',
      participants,
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      members: participants,
    };
    
    const newDMRef = push(ref(rtdb, CHANNELS_PATH));
    await set(newDMRef, dmData);
    return { id: newDMRef.key };
  },

  markMessagesAsRead: async (channelId, messageIds, userId) => {
    if (!messageIds.length) return;
    const updates = {};
    messageIds.forEach((messageId) => {
      updates[`${MESSAGES_PATH}/${channelId}/${messageId}/readBy/${userId}`] = true;
    });
    await update(ref(rtdb), updates);
  },

  markChannelAsRead: async (channelId, userId) => {
    await update(ref(rtdb, `${CHANNELS_PATH}/${channelId}/lastReadBy`), { [userId]: true });
    await update(ref(rtdb, `${CHANNELS_PATH}/${channelId}`), { lastReadAt: serverTimestamp() });
  },

  getChannelById: async (channelId) => {
    const snapshot = await get(ref(rtdb, `${CHANNELS_PATH}/${channelId}`));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
  },

  queryChannelsByType: async (type) => {
    const q = query(ref(rtdb, CHANNELS_PATH), orderByChild('type'), equalTo(type));
    const snapshot = await get(q);
    const channels = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        channels.push({ id: child.key, ...child.val() });
      });
    }
    return channels;
  },

  queryChannelsByMember: async (userId) => {
    // RTDB doesn't have array-contains. We have to fetch all channels and filter.
    const snapshot = await get(ref(rtdb, CHANNELS_PATH));
    const channels = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const data = child.val();
        if (data.members && data.members.includes(userId)) {
          channels.push({ id: child.key, ...data });
        }
      });
    }
    return channels;
  },

  uploadAttachment: async (file, channelId, userId) => {
    const uploadRef = storageRef(
      storage,
      `chat_attachments/${channelId}/${userId}/${Date.now()}_${file.name}`
    );
    const uploadTask = uploadBytesResumable(uploadRef, file);
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progress % 10 < 1) {
            console.info(`Upload progress: ${Math.round(progress)}%`);
          }
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            id: uploadTask.snapshot.ref.name,
            name: file.name,
            url: downloadURL,
            size: file.size,
            type: file.type,
            thumbnailUrl: null,
            uploadedAt: Date.now(), // Realtime DB equivalent for storage sync
            uploadedBy: userId,
          });
        }
      );
    });
  },

  deleteAttachment: async (channelId, attachmentId) => {
    const delRef = storageRef(storage, `chat_attachments/${channelId}/${attachmentId}`);
    await deleteObject(delRef);
  },

  listAttachments: async (channelId) => {
    const listRef = storageRef(storage, `chat_attachments/${channelId}`);
    const result = await listAll(listRef);
    const urls = await Promise.all(
      result.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return { name: item.name, url };
      })
    );
    return urls;
  },

  setPresence: async (userId, userName, userEmail, status = 'online') => {
    if (!userId) return;
    await update(ref(rtdb, `${PRESENCE_PATH}/${userId}`), {
      userId,
      userName,
      userEmail,
      status,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  subscribePresence: (callback) => {
    return onValue(ref(rtdb, PRESENCE_PATH), (snapshot) => {
      const presence = {};
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          presence[child.key] = child.val();
        });
      }
      callback(presence);
    });
  },

  setTyping: async (channelId, userId, userName, isTyping) => {
    const typingRef = ref(rtdb, `${TYPING_PATH}/${channelId}/${userId}`);
    if (isTyping) {
      await update(typingRef, {
        userId,
        userName,
        channelId,
        isTyping: true,
        updatedAt: serverTimestamp(),
      });
    } else {
      await remove(typingRef);
    }
  },

  subscribeTyping: (channelId, callback) => {
    return onValue(ref(rtdb, `${TYPING_PATH}/${channelId}`), (snapshot) => {
      const typingUsers = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          if (child.val().isTyping) {
            typingUsers.push(child.val());
          }
        });
      }
      callback(typingUsers);
    });
  },

  searchConversations: async (userId, searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];
    const term = searchTerm.trim().toLowerCase();
    const channels = await chatService.queryChannelsByMember(userId);
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
    );
  },

  getUnreadCount: async (channelId, userId) => {
    const snapshot = await get(ref(rtdb, `${CHANNELS_PATH}/${channelId}`));
    if (!snapshot.exists()) return 0;
    const channelData = snapshot.val();
    const lastReadAt = channelData.lastReadAt || 0;
    if (!lastReadAt) return 0;
    
    // In RTDB, we fetch all messages after lastReadAt
    const messagesQuery = query(
      ref(rtdb, `${MESSAGES_PATH}/${channelId}`),
      orderByChild('createdAt')
    );
    const msgSnapshot = await get(messagesQuery);
    
    let count = 0;
    if (msgSnapshot.exists()) {
      msgSnapshot.forEach(child => {
        const msg = child.val();
        if (msg.createdAt > lastReadAt && msg.senderId !== userId) {
          count++;
        }
      });
    }
    
    return count;
  },
};
