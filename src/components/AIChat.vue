<template>
  <div class="ai-chat">
    <div class="chat-header">
      <h3>AI Support Chat</h3>
      <button v-if="messages.length > 0" @click="clearChat" class="clear-btn">Clear Chat</button>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
        <div class="message-content">
          {{ message.content }}
        </div>
        <div class="message-timestamp">
          {{ formatTimestamp(message.timestamp) }}
        </div>
      </div>
      <div v-if="isLoading" class="message assistant">
        <div class="message-content">
          <span class="typing-indicator">...</span>
        </div>
      </div>
    </div>

    <div v-if="requiresEscalation" class="escalation-warning">
      <p>⚠️ This conversation requires human support. Would you like to speak with a therapist?</p>
      <button @click="handleEscalation" class="escalate-btn">Connect with Therapist</button>
    </div>

    <div class="chat-input">
      <textarea
        v-model="newMessage"
        @keydown.enter.prevent="handleSendMessage"
        placeholder="Type your message..."
        :disabled="isLoading"
      ></textarea>
      <button
        @click="handleSendMessage"
        :disabled="isLoading || !newMessage.trim()"
        class="send-btn"
      >
        Send
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import { useAIChatStore } from '@/stores/aiChat';
import type { Message } from '@/services/aiChat';

const aiChatStore = useAIChatStore();
const messagesContainer = ref<HTMLElement | null>(null);
const newMessage = ref('');

// Use computed properties for reactive store values
const messages = computed(() => aiChatStore.messages);
const isLoading = computed(() => aiChatStore.isLoading);
const error = computed(() => aiChatStore.error);
const requiresEscalation = computed(() => aiChatStore.requiresEscalation);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTimestamp = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString();
};

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value) return;

  try {
    await aiChatStore.sendMessage(newMessage.value.trim());
    newMessage.value = '';
    await scrollToBottom();
  } catch (err) {
    console.error('Failed to send message:', err);
    // Show error in chat
    const errorMessage: Message = {
      role: 'assistant',
      content:
        err instanceof Error ? err.message : 'Failed to send message. Please try again later.',
      timestamp: new Date(),
    };
    aiChatStore.messages = [...aiChatStore.messages, errorMessage];
    await scrollToBottom();
  }
};

const handleEscalation = () => {
  // TODO: Implement escalation logic to connect with a therapist
  console.log('Escalating to human support');
};

const clearChat = () => {
  aiChatStore.clearChat();
};

// Watch messages for changes and scroll to bottom
watch(() => aiChatStore.messages, scrollToBottom, { deep: true });

onMounted(async () => {
  // Only initialize if there are no messages
  if (messages.value.length === 0) {
    aiChatStore.initializeChat();
  }
  await nextTick();
  await scrollToBottom();
});
</script>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 80px; /* Use margin instead of padding for space above bottom nav */
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.chat-header h3 {
  margin: 0;
  color: #333;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}

.clear-btn:hover {
  background: #e0e0e0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: 80px;
}

.message {
  margin-bottom: 1rem;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: #f0f0f0;
}

.message.user .message-content {
  background: #007aff;
  color: white;
}

.message-timestamp {
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
}

.typing-indicator {
  display: inline-block;
  animation: typing 1s infinite;
}

@keyframes typing {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}

.escalation-warning {
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  margin: 0 1rem;
}

.escalate-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.escalate-btn:hover {
  background: #c82333;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
  margin-top: 8px; /* Extra space above input */
}

textarea {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  min-height: 40px;
  max-height: 120px;
}

.send-btn {
  padding: 0.75rem 1.5rem;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  padding: 0.5rem 1rem;
  color: #dc3545;
  font-size: 0.875rem;
}
</style>
