<template>
  <div class="min-h-screen bg-gray-50">
    <TopNav title="AI Chat Support" />
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="chat-messages space-y-4 mb-6" ref="messagesContainer">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-gray-700">
              Hello! I'm your AI support assistant. How can I help you today?
            </p>
          </div>
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="flex"
            :class="message.isUser ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[80%] rounded-lg p-4"
              :class="message.isUser ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-700'"
            >
              <p>{{ message.text }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Type your message..."
            class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            :disabled="loading"
          />
          <button
            type="submit"
            class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            :disabled="!newMessage.trim() || loading"
          >
            <template v-if="loading">
              <svg
                class="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </template>
            <span v-else>Send</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import TopNav from '@/components/TopNav.vue';

interface Message {
  text: string;
  isUser: boolean;
}

const messages = ref<Message[]>([
  {
    text: "Hello! I'm your AI support assistant. How can I help you today?",
    isUser: false,
  },
]);
const newMessage = ref('');
const loading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const sendMessage = async () => {
  if (!newMessage.value.trim() || loading.value) return;

  loading.value = true;
  try {
    // Add user message
    messages.value.push({
      text: newMessage.value,
      isUser: true,
    });

    // TODO: Implement chat functionality
    console.log('Sending message:', newMessage.value);
    newMessage.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
});

nextTick(() => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
});
</script>
