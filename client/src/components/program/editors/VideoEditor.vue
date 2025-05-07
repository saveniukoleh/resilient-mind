<template>
  <div class="video-editor">
    <div class="form-group">
      <label>Video URL</label>
      <div class="video-input">
        <input
          v-model="videoUrl"
          type="text"
          class="form-control"
          placeholder="Enter video URL (YouTube, Vimeo, etc.)"
          @input="updateContent"
        />
        <button class="btn btn-secondary" @click="previewVideo" :disabled="!videoUrl">
          Preview
        </button>
      </div>
    </div>

    <div v-if="videoUrl" class="video-preview">
      <iframe
        :src="embedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="video-iframe"
      ></iframe>
    </div>

    <div class="form-group">
      <label>Video Description</label>
      <textarea
        v-model="description"
        class="form-control"
        rows="3"
        placeholder="Enter video description"
        @input="updateContent"
      ></textarea>
    </div>

    <div class="form-group">
      <label>Duration (minutes)</label>
      <input
        v-model.number="duration"
        type="number"
        class="form-control"
        min="1"
        @input="updateContent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface VideoContent {
  url: string;
  description: string;
  duration: number;
}

const props = defineProps<{
  modelValue: VideoContent;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: VideoContent): void;
}>();

const videoUrl = ref(props.modelValue.url);
const description = ref(props.modelValue.description);
const duration = ref(props.modelValue.duration);

const embedUrl = computed(() => {
  if (!videoUrl.value) return '';

  // YouTube
  const youtubeMatch = videoUrl.value.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = videoUrl.value.match(/vimeo\.com\/([0-9]+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return videoUrl.value;
});

watch(
  () => props.modelValue,
  newValue => {
    videoUrl.value = newValue.url;
    description.value = newValue.description;
    duration.value = newValue.duration;
  }
);

const updateContent = () => {
  emit('update:modelValue', {
    url: videoUrl.value,
    description: description.value,
    duration: duration.value,
  });
};

const previewVideo = () => {
  // The preview is handled by the computed embedUrl
  // This function is kept for future functionality if needed
};
</script>

<style scoped>
.video-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
}

.video-input {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.video-preview {
  margin: 1rem 0;
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.form-group {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
