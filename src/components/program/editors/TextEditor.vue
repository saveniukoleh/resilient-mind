<template>
  <div class="text-editor">
    <div class="form-group">
      <label>Content</label>
      <div class="editor-toolbar">
        <button
          class="toolbar-btn"
          @click="formatText('bold')"
          :class="{ active: isFormatActive('bold') }"
        >
          <i class="fas fa-bold"></i>
        </button>
        <button
          class="toolbar-btn"
          @click="formatText('italic')"
          :class="{ active: isFormatActive('italic') }"
        >
          <i class="fas fa-italic"></i>
        </button>
        <button
          class="toolbar-btn"
          @click="formatText('underline')"
          :class="{ active: isFormatActive('underline') }"
        >
          <i class="fas fa-underline"></i>
        </button>
        <div class="toolbar-separator"></div>
        <button
          class="toolbar-btn"
          @click="formatText('bullet')"
          :class="{ active: isFormatActive('bullet') }"
        >
          <i class="fas fa-list-ul"></i>
        </button>
        <button
          class="toolbar-btn"
          @click="formatText('number')"
          :class="{ active: isFormatActive('number') }"
        >
          <i class="fas fa-list-ol"></i>
        </button>
      </div>
      <div
        ref="editor"
        class="editor-content"
        contenteditable="true"
        @input="updateContent"
        @keydown="handleKeydown"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const editor = ref<HTMLElement | null>(null);

onMounted(() => {
  if (editor.value) {
    editor.value.innerHTML = props.modelValue;
  }
});

watch(
  () => props.modelValue,
  newValue => {
    if (editor.value && editor.value.innerHTML !== newValue) {
      editor.value.innerHTML = newValue;
    }
  }
);

const updateContent = () => {
  if (editor.value) {
    emit('update:modelValue', editor.value.innerHTML);
  }
};

const formatText = (command: string) => {
  if (!editor.value) return;

  switch (command) {
    case 'bold':
      document.execCommand('bold', false);
      break;
    case 'italic':
      document.execCommand('italic', false);
      break;
    case 'underline':
      document.execCommand('underline', false);
      break;
    case 'bullet':
      document.execCommand('insertUnorderedList', false);
      break;
    case 'number':
      document.execCommand('insertOrderedList', false);
      break;
  }
};

const isFormatActive = (command: string): boolean => {
  if (!editor.value) return false;
  return document.queryCommandState(command);
};

const handleKeydown = (event: KeyboardEvent) => {
  // Handle tab key
  if (event.key === 'Tab') {
    event.preventDefault();
    document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
  }
};
</script>

<style scoped>
.text-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.editor-toolbar {
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 0.5rem;
  background: #f8f9fa;
}

.toolbar-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  color: #495057;
}

.toolbar-btn:hover {
  background: #e9ecef;
}

.toolbar-btn.active {
  background: #e9ecef;
  border-color: #adb5bd;
}

.toolbar-separator {
  width: 1px;
  background: #ddd;
  margin: 0 0.5rem;
}

.editor-content {
  min-height: 200px;
  padding: 1rem;
  outline: none;
}

.editor-content:focus {
  background: #fff;
}

.editor-content ul,
.editor-content ol {
  margin-left: 1.5rem;
}

.editor-content p {
  margin: 0.5rem 0;
}
</style>
