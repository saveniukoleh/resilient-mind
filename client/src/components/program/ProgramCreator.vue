<template>
  <div class="program-creator">
    <div class="program-creator__header">
      <h1>Create New Program</h1>
      <div class="program-creator__actions">
        <button class="btn btn-secondary" @click="showTemplates = true">Use Template</button>
        <button class="btn btn-secondary" @click="saveAsDraft" :disabled="isSaving">
          Save as Draft
        </button>
        <button class="btn btn-primary" @click="publishProgram" :disabled="isSaving || !isValid">
          Publish Program
        </button>
      </div>
    </div>

    <div class="program-creator__content">
      <!-- Template Selection Modal -->
      <div v-if="showTemplates" class="modal">
        <div class="modal__content">
          <div class="modal__header">
            <h2>Select a Template</h2>
            <button class="modal__close" @click="showTemplates = false">&times;</button>
          </div>
          <div class="modal__body">
            <TemplateManager @use-template="useTemplate" />
          </div>
        </div>
      </div>

      <!-- Basic Information -->
      <section class="program-creator__section">
        <h2>Basic Information</h2>
        <div class="form-group">
          <label for="title">Program Title</label>
          <input
            id="title"
            v-model="program.title"
            type="text"
            class="form-control"
            placeholder="Enter program title"
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="program.description"
            class="form-control"
            rows="4"
            placeholder="Enter program description"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="difficulty">Difficulty Level</label>
            <select id="difficulty" v-model="program.difficulty" class="form-control">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div class="form-group col-md-6">
            <label for="duration">Estimated Duration (minutes)</label>
            <input
              id="duration"
              v-model.number="program.estimatedDuration"
              type="number"
              class="form-control"
              min="1"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="tags">Tags</label>
          <div class="tags-input">
            <div v-for="tag in program.tags" :key="tag" class="tag">
              {{ tag }}
              <button class="tag-remove" @click="removeTag(tag)">×</button>
            </div>
            <input
              id="tags"
              v-model="newTag"
              type="text"
              class="form-control"
              placeholder="Add tags"
              @keyup.enter="addTag"
            />
          </div>
        </div>
      </section>

      <!-- Modules -->
      <section class="program-creator__section">
        <ModuleManager v-model="program.modules" />
      </section>

      <div class="program-creator__sidebar">
        <div class="sidebar-section">
          <h3>Version History</h3>
          <VersionManager v-model:program="program" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Program, Module, ModuleContent } from '../../types/program';
import { programService } from '../../services/programService';
import { useToast } from 'vue-toastification';
import TextEditor from './editors/TextEditor.vue';
import VideoEditor from './editors/VideoEditor.vue';
import ExerciseEditor from './editors/ExerciseEditor.vue';
import QuizEditor from './editors/QuizEditor.vue';
import ModuleManager from './ModuleManager.vue';
import TemplateManager from './TemplateManager.vue';
import VersionManager from './VersionManager.vue';

const toast = useToast();
const isSaving = ref(false);
const newTag = ref('');
const showTemplates = ref(false);

const program = ref<Omit<Program, 'id' | 'createdAt' | 'updatedAt'>>({
  title: '',
  description: '',
  modules: [],
  createdBy: '', // Will be set from auth
  version: 1,
  status: 'draft',
  tags: [],
  difficulty: 'beginner',
  estimatedDuration: 0,
});

const isValid = computed(() => {
  return (
    program.value.title.trim() !== '' &&
    program.value.description.trim() !== '' &&
    program.value.modules.length > 0 &&
    program.value.estimatedDuration > 0
  );
});

const addTag = () => {
  if (newTag.value.trim() && !program.value.tags.includes(newTag.value.trim())) {
    program.value.tags.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (tag: string) => {
  program.value.tags = program.value.tags.filter(t => t !== tag);
};

const addModule = () => {
  program.value.modules.push({
    id: crypto.randomUUID(),
    title: '',
    description: '',
    content: [],
    order: program.value.modules.length + 1,
    duration: 0,
  });
};

const removeModule = (index: number) => {
  program.value.modules.splice(index, 1);
  // Update order numbers
  program.value.modules.forEach((module, i) => {
    module.order = i + 1;
  });
};

const addContent = (module: Module) => {
  module.content.push({
    id: crypto.randomUUID(),
    type: 'text',
    content: '',
    order: module.content.length + 1,
  });
};

const removeContent = (module: Module, index: number) => {
  module.content.splice(index, 1);
  // Update order numbers
  module.content.forEach((content, i) => {
    content.order = i + 1;
  });
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

const saveAsDraft = async () => {
  try {
    isSaving.value = true;
    program.value.status = 'draft';
    await programService.createProgram(program.value);
    toast.success('Program saved as draft');
  } catch (error) {
    toast.error('Failed to save program');
    console.error(error);
  } finally {
    isSaving.value = false;
  }
};

const publishProgram = async () => {
  try {
    isSaving.value = true;
    program.value.status = 'published';
    await programService.createProgram(program.value);
    toast.success('Program published successfully');
  } catch (error) {
    toast.error('Failed to publish program');
    console.error(error);
  } finally {
    isSaving.value = false;
  }
};

const useTemplate = (template: Program) => {
  program.value = {
    title: template.title,
    description: template.description,
    modules: template.modules.map(module => ({
      ...module,
      id: crypto.randomUUID(),
      content: module.content.map(content => ({
        ...content,
        id: crypto.randomUUID(),
      })),
    })),
    createdBy: '', // Will be set from auth
    version: 1,
    status: 'draft',
    tags: [...template.tags],
    difficulty: template.difficulty,
    estimatedDuration: template.estimatedDuration,
  };
  showTemplates.value = false;
  toast.success('Template applied successfully');
};
</script>

<style scoped>
.program-creator {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.program-creator__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.program-creator__section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.tag {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-remove {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0;
}

.module-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.module-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.content-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.content-item__header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.program-creator__content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-top: 2rem;
}

.program-creator__main {
  flex: 1;
}

.program-creator__sidebar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}
</style>
