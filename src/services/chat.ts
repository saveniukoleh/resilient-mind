import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  setDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import type {
  Chat,
  ChatMessage,
  ChatParticipant,
  ChatFilters,
  ChatNotification,
} from '@/types/chat';

export const createChat = async (
  participants: string[],
  isGroup: boolean = false,
  groupName?: string
): Promise<Chat> => {
  try {
    const chatRef = doc(collection(db, 'chats'));
    const chat: Omit<Chat, 'id'> = {
      participants,
      createdAt: new Date(),
      updatedAt: new Date(),
      isGroup,
      groupName,
    };

    await setDoc(chatRef, {
      ...chat,
      id: chatRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create participant records
    await Promise.all(
      participants.map(async userId => {
        const participantRef = doc(collection(db, 'chatParticipants'));
        const participant: Omit<ChatParticipant, 'id'> = {
          chatId: chatRef.id,
          userId,
          joinedAt: new Date(),
          lastReadAt: new Date(),
          isAdmin: isGroup && participants[0] === userId,
          isMuted: false,
          isPinned: false,
        };

        await setDoc(participantRef, {
          ...participant,
          id: participantRef.id,
          joinedAt: serverTimestamp(),
          lastReadAt: serverTimestamp(),
        });
      })
    );

    return {
      ...chat,
      id: chatRef.id,
    };
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const getChat = async (id: string): Promise<Chat | null> => {
  try {
    const chatDoc = await getDoc(doc(db, 'chats', id));
    if (chatDoc.exists()) {
      const data = chatDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Chat;
    }
    return null;
  } catch (error) {
    console.error('Error fetching chat:', error);
    throw error;
  }
};

export const updateChat = async (id: string, updates: Partial<Chat>): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', id);
    await updateDoc(chatRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    throw error;
  }
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  content: string,
  type: ChatMessage['type'] = 'text',
  metadata?: ChatMessage['metadata']
): Promise<ChatMessage> => {
  try {
    const messageRef = doc(collection(db, 'messages'));
    const message: Omit<ChatMessage, 'id'> = {
      chatId,
      senderId,
      type,
      content,
      status: 'sending',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata,
    };

    await setDoc(messageRef, {
      ...message,
      id: messageRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update chat's last message
    await updateChat(chatId, {
      lastMessage: {
        ...message,
        id: messageRef.id,
      },
    });

    return {
      ...message,
      id: messageRef.id,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const uploadFile = async (
  file: File,
  chatId: string,
  type: 'image' | 'file'
): Promise<{ url: string; metadata: ChatMessage['metadata'] }> => {
  try {
    const timestamp = Date.now();
    const fileName = `${chatId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const metadata: ChatMessage['metadata'] = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: url,
    };

    if (type === 'image') {
      const img = new Image();
      img.src = url;
      await new Promise(resolve => {
        img.onload = resolve;
      });
      metadata.imageUrl = url;
      metadata.imageWidth = img.width;
      metadata.imageHeight = img.height;
    }

    return { url, metadata };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getMessages = async (
  chatId: string,
  lastDoc?: any,
  pageSize: number = 20
): Promise<{ messages: ChatMessage[]; lastDoc: any }> => {
  try {
    let q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as ChatMessage;
    });
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      messages,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const searchChats = async (
  filters: ChatFilters,
  lastDoc?: any,
  pageSize: number = 20
): Promise<{ chats: Chat[]; lastDoc: any }> => {
  try {
    let q = query(collection(db, 'chats'));

    if (filters.participants?.length) {
      q = query(q, where('participants', 'array-contains-any', filters.participants));
    }
    if (filters.isGroup !== undefined) {
      q = query(q, where('isGroup', '==', filters.isGroup));
    }

    q = query(q, orderBy('updatedAt', 'desc'), limit(pageSize));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const chats = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Chat;
    });
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      chats,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error('Error searching chats:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    const participantRef = doc(db, 'chatParticipants', `${chatId}_${userId}`);
    await updateDoc(participantRef, {
      lastReadAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'messages'),
    where('chatId', '==', chatId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as ChatMessage;
    });
    callback(messages);
  });
};

export const createNotification = async (
  notification: Omit<ChatNotification, 'id'>
): Promise<void> => {
  try {
    const notificationRef = doc(collection(db, 'chatNotifications'));
    await setDoc(notificationRef, {
      ...notification,
      id: notificationRef.id,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'chatNotifications', id);
    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};
