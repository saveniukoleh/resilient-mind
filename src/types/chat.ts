export type MessageType = 'text' | 'image' | 'file' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
  };
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: Date;
  updatedAt: Date;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmins?: string[];
  mutedBy?: string[];
  pinnedBy?: string[];
}

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  joinedAt: Date;
  lastReadAt: Date;
  isAdmin: boolean;
  isMuted: boolean;
  isPinned: boolean;
}

export interface ChatFilters {
  searchTerm?: string;
  participants?: string[];
  isGroup?: boolean;
  hasUnread?: boolean;
  isPinned?: boolean;
}

export interface ChatNotification {
  id: string;
  chatId: string;
  userId: string;
  messageId: string;
  type: 'message' | 'mention' | 'system';
  read: boolean;
  createdAt: Date;
  data?: {
    senderName?: string;
    messagePreview?: string;
    groupName?: string;
  };
}
