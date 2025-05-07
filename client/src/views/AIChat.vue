<template>
  <div class="ai-chat-view">
    <div class="container">
      <h1>AI Support Chat</h1>
      <p class="description">
        Chat with our AI assistant for immediate support and guidance. The AI can help with:
      </p>
      <ul class="features">
        <li>General mental health information and resources</li>
        <li>Stress management techniques</li>
        <li>Basic emotional support</li>
        <li>Guided breathing exercises</li>
        <li>Information about therapy and counseling</li>
      </ul>
      <div class="disclaimer">
        <p>
          ⚠️ Important: This is an AI assistant and not a replacement for professional mental health
          care.
        </p>
        <p>
          If you're experiencing a crisis or need immediate help, please contact emergency services
          or a mental health crisis hotline.
        </p>
      </div>
      <AIChat class="chat-container" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAIChatStore } from '@/stores/aiChat';
import AIChat from '@/components/AIChat.vue';

const aiChatStore = useAIChatStore();

onMounted(() => {
  aiChatStore.initializeChat();
});
</script>

<style scoped>
.ai-chat-view {
  padding: 2rem;
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

.description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}

.features li {
  padding: 0.5rem 0;
  color: #555;
  display: flex;
  align-items: center;
}

.features li::before {
  content: '✓';
  color: #28a745;
  margin-right: 0.5rem;
}

.disclaimer {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.disclaimer p {
  margin: 0.5rem 0;
  color: #856404;
}

.chat-container {
  height: 600px;
  margin-top: 2rem;
}
</style>
