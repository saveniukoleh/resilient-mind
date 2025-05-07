<template>
  <div class="template-manager">
    <div class="template-manager__header">
      <h2>Program Templates</h2>
      <div class="template-manager__actions">
        <button class="btn btn-primary" @click="showCreateTemplateModal = true">
          Create New Template
        </button>
      </div>
    </div>

    <div class="template-grid">
      <div v-for="template in templates" :key="template.id" class="template-card">
        <div class="template-card__header">
          <h3>{{ template.title }}</h3>
          <div class="template-card__actions">
            <button class="btn btn-secondary" @click="useTemplate(template)">Use Template</button>
            <button class="btn btn-secondary" @click="editTemplate(template)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger" @click="deleteTemplate(template)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="template-card__content">
          <p class="template-card__description">{{ template.description }}</p>
          <div class="template-card__meta">
            <div class="meta-item">
              <i class="fas fa-clock"></i>
              {{ template.estimatedDuration }} minutes
            </div>
            <div class="meta-item">
              <i class="fas fa-layer-group"></i>
              {{ template.modules.length }} modules
            </div>
            <div class="meta-item">
              <i class="fas fa-signal"></i>
              {{ template.difficulty }}
            </div>
          </div>
          <div class="template-card__tags">
            <span v-for="tag in template.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Template Modal -->
    <div v-if="showCreateTemplateModal" class="modal">
      <div class="modal__content">
        <div class="modal__header">
          <h3>{{ editingTemplate ? 'Edit Template' : 'Create New Template' }}</h3>
          <button class="modal__close" @click="closeModal">&times;</button>
        </div>

        <div class="modal__body">
          <div class="form-group">
            <label>Template Title</label>
            <input
              v-model="templateForm.title"
              type="text"
              class="form-control"
              placeholder="Enter template title"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="templateForm.description"
              class="form-control"
              rows="3"
              placeholder="Enter template description"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group col-md-6">
              <label>Difficulty Level</label>
              <select v-model="templateForm.difficulty" class="form-control">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div class="form-group col-md-6">
              <label>Estimated Duration (minutes)</label>
              <input
                v-model.number="templateForm.estimatedDuration"
                type="number"
                class="form-control"
                min="1"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Tags</label>
            <div class="tags-input">
              <div v-for="tag in templateForm.tags" :key="tag" class="tag">
                {{ tag }}
                <button class="tag-remove" @click="removeTag(tag)">×</button>
              </div>
              <input
                v-model="newTag"
                type="text"
                class="form-control"
                placeholder="Add tags"
                @keyup.enter="addTag"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Modules</label>
            <ModuleManager v-model="templateForm.modules" />
          </div>
        </div>

        <div class="modal__footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="saveTemplate" :disabled="!isValid">
            {{ editingTemplate ? 'Update Template' : 'Create Template' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Program, Module } from '../../types/program';
import { programService } from '../../services/programService';
import { useToast } from 'vue-toastification';
import ModuleManager from './ModuleManager.vue';

const toast = useToast();
const templates = ref<Program[]>([]);
const showCreateTemplateModal = ref(false);
const editingTemplate = ref<Program | null>(null);
const newTag = ref('');

const templateForm = ref<Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'status'>>({
  title: '',
  description: '',
  modules: [],
  createdBy: '', // Will be set from auth
  version: 1,
  tags: [],
  difficulty: 'beginner',
  estimatedDuration: 0,
});

const isValid = computed(() => {
  return (
    templateForm.value.title.trim() !== '' &&
    templateForm.value.description.trim() !== '' &&
    templateForm.value.modules.length > 0 &&
    templateForm.value.estimatedDuration > 0
  );
});

const loadTemplates = async () => {
  try {
    templates.value = await programService.listPrograms({ status: 'template' });
  } catch (error) {
    toast.error('Failed to load templates');
    console.error(error);
  }
};

const useTemplate = (template: Program) => {
  // Emit event to parent to use this template
  emit('use-template', template);
};

const editTemplate = (template: Program) => {
  editingTemplate.value = template;
  templateForm.value = {
    title: template.title,
    description: template.description,
    modules: [...template.modules],
    createdBy: template.createdBy,
    version: template.version,
    tags: [...template.tags],
    difficulty: template.difficulty,
    estimatedDuration: template.estimatedDuration,
  };
  showCreateTemplateModal.value = true;
};

const deleteTemplate = async (template: Program) => {
  if (confirm('Are you sure you want to delete this template?')) {
    try {
      await programService.deleteProgram(template.id);
      await loadTemplates();
      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
      console.error(error);
    }
  }
};

const addTag = () => {
  if (newTag.value.trim() && !templateForm.value.tags.includes(newTag.value.trim())) {
    templateForm.value.tags.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (tag: string) => {
  templateForm.value.tags = templateForm.value.tags.filter(t => t !== tag);
};

const closeModal = () => {
  showCreateTemplateModal.value = false;
  editingTemplate.value = null;
  templateForm.value = {
    title: '',
    description: '',
    modules: [],
    createdBy: '',
    version: 1,
    tags: [],
    difficulty: 'beginner',
    estimatedDuration: 0,
  };
};

const saveTemplate = async () => {
  try {
    if (editingTemplate.value) {
      await programService.updateProgram(editingTemplate.value.id, templateForm.value);
      toast.success('Template updated successfully');
    } else {
      await programService.createProgram({
        ...templateForm.value,
        status: 'template',
      });
      toast.success('Template created successfully');
    }
    await loadTemplates();
    closeModal();
  } catch (error) {
    toast.error('Failed to save template');
    console.error(error);
  }
};

const emit = defineEmits<{
  (e: 'use-template', template: Program): void;
}>();

// Load templates when component is mounted
loadTemplates();
</script>

<style scoped>
.template-manager {
  padding: 1rem;
}

.template-manager__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.template-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.template-card__header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-card__header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #495057;
}

.template-card__actions {
  display: flex;
  gap: 0.5rem;
}

.template-card__content {
  padding: 1rem;
}

.template-card__description {
  color: #6c757d;
  margin-bottom: 1rem;
}

.template-card__meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #6c757d;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal__content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal__header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal__body {
  padding: 1rem;
}

.modal__footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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

.tag-remove {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0;
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
</style>
