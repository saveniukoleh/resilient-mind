<template>
  <div class="min-h-screen bg-gray-50">
    <TopNav title="Community Support" subtitle="Coming Soon" />
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Post Filters -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-wrap gap-4">
          <button
            v-for="filter in filters"
            :key="filter"
            class="px-4 py-2 rounded-full text-sm font-medium"
            :class="
              activeFilter === filter
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="activeFilter = filter"
          >
            {{ filter }}
          </button>
        </div>
      </div>

      <!-- Community Posts -->
      <div class="space-y-6">
        <div v-for="post in filteredPosts" :key="post.id" class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span class="text-gray-600 font-medium">{{ post.author[0] }}</span>
              </div>
              <div class="ml-3">
                <h3 class="text-lg font-semibold text-gray-900">{{ post.author }}</h3>
                <p class="text-sm text-gray-500">{{ post.date }}</p>
              </div>
            </div>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="getCategoryClass(post.category)"
            >
              {{ post.category }}
            </span>
          </div>
          <p class="text-gray-700 mb-4">{{ post.content }}</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button class="flex items-center text-gray-500 hover:text-primary-600">
                <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{{ post.likes }}</span>
              </button>
              <button class="flex items-center text-gray-500 hover:text-primary-600">
                <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{{ post.comments }}</span>
              </button>
            </div>
            <button class="text-gray-500 hover:text-primary-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TopNav from '@/components/TopNav.vue';

const filters = ['All', 'Support', 'Success Stories', 'Resources', 'Events'];
const activeFilter = ref('All');

interface Post {
  id: number;
  author: string;
  date: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
}

const posts = ref<Post[]>([
  {
    id: 1,
    author: 'Sarah Johnson',
    date: '2 hours ago',
    content:
      "Just completed my first week of therapy and feeling much more hopeful about the future. Remember, it's okay to take small steps!",
    category: 'Success Stories',
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    author: 'Michael Chen',
    date: '5 hours ago',
    content: 'Looking for recommendations for mindfulness apps. What works best for you?',
    category: 'Resources',
    likes: 12,
    comments: 15,
  },
  {
    id: 3,
    author: 'Emma Wilson',
    date: '1 day ago',
    content: 'Struggling with anxiety today. Any tips for managing overwhelming thoughts?',
    category: 'Support',
    likes: 45,
    comments: 23,
  },
]);

const filteredPosts = computed(() => {
  if (activeFilter.value === 'All') return posts.value;
  return posts.value.filter(post => post.category === activeFilter.value);
});

const getCategoryClass = (category: string) => {
  const classes = {
    'Success Stories': 'bg-green-100 text-green-800',
    Resources: 'bg-blue-100 text-blue-800',
    Support: 'bg-purple-100 text-purple-800',
    Events: 'bg-yellow-100 text-yellow-800',
  };
  return classes[category as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};
</script>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}
</style>
