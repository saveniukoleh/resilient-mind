import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AIChatService } from '@/services/aiChat';
import type { Message, ChatContext, ChatResponse } from '@/services/aiChat';
import { useUserStore } from './user';

export const useAIChatStore = defineStore('aiChat', () => {
  const userStore = useUserStore();
  const messages = ref<Message[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const requiresEscalation = ref(false);
  const chatService = ref<AIChatService | null>(null);

  const context = computed<ChatContext>(() => ({
    userId: userStore.user?.uid || '',
    userRole: userStore.user?.role || 'user',
    language: userStore.user?.profile?.language || 'en',
    previousMessages: messages.value,
    userProfile: userStore.user?.profile,
  }));

  const initializeChat = () => {
    // Clear existing messages
    messages.value = [];
    error.value = null;
    requiresEscalation.value = false;

    // Initialize chat service
    chatService.value = new AIChatService(context.value);

    // Add welcome message
    const welcomeMessage: Message = {
      role: 'assistant',
      content:
        "Hello! I'm your AI support assistant. I'm here to help you with general mental health information, stress management techniques, and basic emotional support. How can I assist you today?",
      timestamp: new Date(),
    };
    messages.value = [welcomeMessage];
  };

  const sendMessage = async (content: string) => {
    if (!chatService.value) {
      initializeChat();
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Add user message to chat
      const userMessage: Message = {
        role: 'user',
        content,
        timestamp: new Date(),
      };
      messages.value = [...messages.value, userMessage];

      // Get AI response
      const response = await chatService.value!.sendMessage(content);

      // Add AI response to chat
      const aiMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };
      messages.value = [...messages.value, aiMessage];

      // Update escalation status
      requiresEscalation.value = response.requiresEscalation;

      // Update chat context
      chatService.value!.updateContext(context.value);

      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message';
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content:
          err instanceof Error ? err.message : 'Failed to send message. Please try again later.',
        timestamp: new Date(),
      };
      messages.value = [...messages.value, errorMessage];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const testConnection = async () => {
    if (!chatService.value) {
      initializeChat();
    }
    return chatService.value!.testConnection();
  };

  const clearChat = () => {
    messages.value = [];
    error.value = null;
    requiresEscalation.value = false;
    chatService.value = null;
  };

  const getMessageHistory = () => {
    return messages.value;
  };

  return {
    messages,
    isLoading,
    error,
    requiresEscalation,
    sendMessage,
    clearChat,
    getMessageHistory,
    initializeChat,
    testConnection,
  };
});
