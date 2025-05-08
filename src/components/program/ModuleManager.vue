<template>
  <div class="module-manager">
    <div class="module-manager__header">
      <h2>Module Management</h2>
      <div class="module-manager__actions">
        <button class="btn btn-secondary" @click="toggleModuleOrder">
          {{ isReorderMode ? 'Done Reordering' : 'Reorder Modules' }}
        </button>
        <button class="btn btn-primary" @click="addModule">Add Module</button>
      </div>
    </div>

    <div class="module-list">
      <draggable
        v-model="modules"
        :disabled="!isReorderMode"
        item-key="id"
        handle=".module-drag-handle"
        @change="handleModuleReorder"
      >
        <template #item="{ element: module, index }">
          <div class="module-item" :class="{ 'is-reordering': isReorderMode }">
            <div class="module-item__header">
              <div class="module-item__drag">
                <i v-if="isReorderMode" class="fas fa-grip-vertical module-drag-handle"></i>
              </div>
              <div class="module-item__title">
                <h3>Module {{ index + 1 }}</h3>
                <input
                  v-model="module.title"
                  type="text"
                  class="form-control"
                  placeholder="Enter module title"
                  @input="updateModule(module)"
                />
              </div>
              <div class="module-item__actions">
                <button class="btn btn-secondary" @click="duplicateModule(module)">
                  <i class="fas fa-copy"></i>
                </button>
                <button class="btn btn-danger" @click="removeModule(module)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div class="module-item__content">
              <div class="form-group">
                <label>Description</label>
                <textarea
                  v-model="module.description"
                  class="form-control"
                  rows="3"
                  placeholder="Enter module description"
                  @input="updateModule(module)"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group col-md-6">
                  <label>Duration (minutes)</label>
                  <input
                    v-model.number="module.duration"
                    type="number"
                    class="form-control"
                    min="1"
                    @input="updateModule(module)"
                  />
                </div>

                <div class="form-group col-md-6">
                  <label>Prerequisites</label>
                  <div class="prerequisites-input">
                    <div
                      v-for="(prereq, prereqIndex) in module.prerequisites"
                      :key="prereqIndex"
                      class="prerequisite-item"
                    >
                      <input
                        v-model="module.prerequisites[prereqIndex]"
                        type="text"
                        class="form-control"
                        placeholder="Enter prerequisite"
                        @input="updateModule(module)"
                      />
                      <button
                        class="btn btn-danger"
                        @click="removePrerequisite(module, prereqIndex)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <button class="btn btn-secondary" @click="addPrerequisite(module)">
                      <i class="fas fa-plus"></i> Add Prerequisite
                    </button>
                  </div>
                </div>
              </div>

              <div class="module-item__content-list">
                <h4>Content</h4>
                <draggable
                  v-model="module.content"
                  :disabled="!isReorderMode"
                  item-key="id"
                  handle=".content-drag-handle"
                  @change="handleContentReorder(module)"
                >
                  <template #item="{ element: content, index }">
                    <div class="content-item" :class="{ 'is-reordering': isReorderMode }">
                      <div class="content-item__header">
                        <div class="content-item__drag">
                          <i
                            v-if="isReorderMode"
                            class="fas fa-grip-vertical content-drag-handle"
                          ></i>
                        </div>
                        <div class="content-item__type">
                          <select
                            v-model="content.type"
                            class="form-control"
                            @change="handleContentTypeChange(module, content)"
                          >
                            <option value="text">Text</option>
                            <option value="video">Video</option>
                            <option value="exercise">Exercise</option>
                            <option value="quiz">Quiz</option>
                          </select>
                        </div>
                        <div class="content-item__actions">
                          <button class="btn btn-danger" @click="removeContent(module, index)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      <component
                        :is="getContentEditor(content.type)"
                        v-model="content.content"
                        @update:modelValue="updateModule(module)"
                      />
                    </div>
                  </template>
                </draggable>

                <button class="btn btn-secondary" @click="addContent(module)">
                  <i class="fas fa-plus"></i> Add Content
                </button>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { Module, ModuleContent } from '../../types/program';
import TextEditor from './editors/TextEditor.vue';
import VideoEditor from './editors/VideoEditor.vue';
import ExerciseEditor from './editors/ExerciseEditor.vue';
import QuizEditor from './editors/QuizEditor.vue';

const props = defineProps<{
  modelValue: Module[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Module[]): void;
}>();

const modules = ref<Module[]>(props.modelValue);
const isReorderMode = ref(false);

watch(
  () => props.modelValue,
  newValue => {
    modules.value = [...newValue];
  }
);

const toggleModuleOrder = () => {
  isReorderMode.value = !isReorderMode.value;
};

const addModule = () => {
  const newModule: Module = {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    content: [],
    order: modules.value.length + 1,
    duration: 0,
    prerequisites: [],
  };
  modules.value.push(newModule);
  emit('update:modelValue', modules.value);
};

const removeModule = (module: Module) => {
  const index = modules.value.findIndex(m => m.id === module.id);
  if (index !== -1) {
    modules.value.splice(index, 1);
    // Update order numbers
    modules.value.forEach((m, i) => {
      m.order = i + 1;
    });
    emit('update:modelValue', modules.value);
  }
};

const duplicateModule = (module: Module) => {
  const newModule: Module = {
    ...module,
    id: crypto.randomUUID(),
    title: `${module.title} (Copy)`,
    order: modules.value.length + 1,
  };
  modules.value.push(newModule);
  emit('update:modelValue', modules.value);
};

const updateModule = (module: Module) => {
  const index = modules.value.findIndex(m => m.id === module.id);
  if (index !== -1) {
    modules.value[index] = { ...module };
    emit('update:modelValue', modules.value);
  }
};

const handleModuleReorder = () => {
  // Update order numbers
  modules.value.forEach((module, index) => {
    module.order = index + 1;
  });
  emit('update:modelValue', modules.value);
};

const addContent = (module: Module) => {
  const newContent: ModuleContent = {
    id: crypto.randomUUID(),
    type: 'text',
    content: '',
    order: module.content.length + 1,
  };
  module.content.push(newContent);
  updateModule(module);
};

const removeContent = (module: Module, index: number) => {
  module.content.splice(index, 1);
  // Update order numbers
  module.content.forEach((content, i) => {
    content.order = i + 1;
  });
  updateModule(module);
};

const handleContentReorder = (module: Module) => {
  // Update order numbers
  module.content.forEach((content, index) => {
    content.order = index + 1;
  });
  updateModule(module);
};

const handleContentTypeChange = (module: Module, content: ModuleContent) => {
  // Reset content based on new type
  switch (content.type) {
    case 'text':
      content.content = '';
      break;
    case 'video':
      content.content = { url: '', description: '', duration: 0 };
      break;
    case 'exercise':
      content.content = {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        type: 'breathing',
        instructions: [''],
        duration: 0,
        difficulty: 'beginner',
      };
      break;
    case 'quiz':
      content.content = {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        questions: [],
        passingScore: 70,
      };
      break;
  }
  updateModule(module);
};

const addPrerequisite = (module: Module) => {
  if (!module.prerequisites) {
    module.prerequisites = [];
  }
  module.prerequisites.push('');
  updateModule(module);
};

const removePrerequisite = (module: Module, index: number) => {
  if (module.prerequisites) {
    module.prerequisites.splice(index, 1);
    updateModule(module);
  }
};

const getContentEditor = (type: ModuleContent['type']) => {
  switch (type) {
    case 'text':
      return TextEditor;
    case 'video':
      return VideoEditor;
    case 'exercise':
      return ExerciseEditor;
    case 'quiz':
      return QuizEditor;
    default:
      return 'div';
  }
};
</script>

<style scoped>
.module-manager {
  padding: 1rem;
}

.module-manager__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  background: white;
  transition: all 0.2s ease;
}

.module-item.is-reordering {
  cursor: move;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.module-item__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.module-item__drag {
  width: 24px;
  text-align: center;
  color: #6c757d;
}

.module-item__title {
  flex: 1;
}

.module-item__title h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #495057;
}

.module-item__actions {
  display: flex;
  gap: 0.5rem;
}

.module-item__content {
  padding-left: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.prerequisites-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prerequisite-item {
  display: flex;
  gap: 0.5rem;
}

.content-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.content-item.is-reordering {
  cursor: move;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-item__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.content-item__drag {
  width: 24px;
  text-align: center;
  color: #6c757d;
}

.content-item__type {
  flex: 1;
}

.content-item__actions {
  display: flex;
  gap: 0.5rem;
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

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.module-drag-handle,
.content-drag-handle {
  cursor: move;
}
</style>
