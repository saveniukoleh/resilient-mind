<template>
  <div class="version-manager">
    <div class="version-manager__header">
      <h2>Version History</h2>
      <div class="version-manager__actions">
        <button class="btn btn-primary" @click="showCreateVersionModal = true">
          Create New Version
        </button>
      </div>
    </div>

    <div class="version-timeline">
      <div v-for="version in sortedVersions" :key="version.id" class="version-item">
        <div class="version-item__header">
          <div class="version-item__meta">
            <span class="version-number">v{{ version.version }}</span>
            <span class="version-date">{{ formatDate(version.createdAt) }}</span>
            <span class="version-status" :class="version.status">{{ version.status }}</span>
          </div>
          <div class="version-item__actions">
            <button
              v-if="version.id !== program.currentVersionId"
              class="btn btn-secondary"
              @click="previewVersion(version)"
            >
              Preview
            </button>
            <button
              v-if="version.id !== program.currentVersionId"
              class="btn btn-primary"
              @click="restoreVersion(version)"
            >
              Restore
            </button>
            <button
              v-if="version.id !== program.currentVersionId"
              class="btn btn-danger"
              @click="deleteVersion(version)"
            >
              Delete
            </button>
          </div>
        </div>

        <div class="version-item__content">
          <div v-if="version.changeNotes" class="version-notes">
            <h4>Change Notes</h4>
            <p>{{ version.changeNotes }}</p>
          </div>

          <div class="version-stats">
            <div class="stat-item">
              <i class="fas fa-layer-group"></i>
              {{ version.modules.length }} modules
            </div>
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              {{ version.estimatedDuration }} minutes
            </div>
            <div class="stat-item">
              <i class="fas fa-signal"></i>
              {{ version.difficulty }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Version Modal -->
    <div v-if="showCreateVersionModal" class="modal">
      <div class="modal__content">
        <div class="modal__header">
          <h3>Create New Version</h3>
          <button class="modal__close" @click="closeModal">&times;</button>
        </div>

        <div class="modal__body">
          <div class="form-group">
            <label>Change Notes</label>
            <textarea
              v-model="versionForm.changeNotes"
              class="form-control"
              rows="3"
              placeholder="Describe the changes in this version"
            ></textarea>
          </div>

          <div class="version-preview">
            <h4>Version Preview</h4>
            <div class="preview-content">
              <div class="preview-item">
                <label>Title</label>
                <p>{{ program.title }}</p>
              </div>
              <div class="preview-item">
                <label>Description</label>
                <p>{{ program.description }}</p>
              </div>
              <div class="preview-item">
                <label>Modules</label>
                <p>{{ program.modules.length }} modules</p>
              </div>
              <div class="preview-item">
                <label>Duration</label>
                <p>{{ program.estimatedDuration }} minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal__footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="createVersion" :disabled="!isValid">
            Create Version
          </button>
        </div>
      </div>
    </div>

    <!-- Version Preview Modal -->
    <div v-if="previewVersion" class="modal">
      <div class="modal__content">
        <div class="modal__header">
          <h3>Version {{ previewVersion.version }} Preview</h3>
          <button class="modal__close" @click="previewVersion = null">&times;</button>
        </div>

        <div class="modal__body">
          <div class="version-comparison">
            <div class="comparison-section">
              <h4>Current Version</h4>
              <div class="comparison-content">
                <div class="comparison-item">
                  <label>Title</label>
                  <p>{{ program.title }}</p>
                </div>
                <div class="comparison-item">
                  <label>Description</label>
                  <p>{{ program.description }}</p>
                </div>
                <div class="comparison-item">
                  <label>Modules</label>
                  <p>{{ program.modules.length }} modules</p>
                </div>
                <div class="comparison-item">
                  <label>Duration</label>
                  <p>{{ program.estimatedDuration }} minutes</p>
                </div>
              </div>
            </div>

            <div class="comparison-section">
              <h4>Selected Version</h4>
              <div class="comparison-content">
                <div class="comparison-item">
                  <label>Title</label>
                  <p>{{ previewVersion.title }}</p>
                </div>
                <div class="comparison-item">
                  <label>Description</label>
                  <p>{{ previewVersion.description }}</p>
                </div>
                <div class="comparison-item">
                  <label>Modules</label>
                  <p>{{ previewVersion.modules.length }} modules</p>
                </div>
                <div class="comparison-item">
                  <label>Duration</label>
                  <p>{{ previewVersion.estimatedDuration }} minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Program, ProgramVersion } from '../../types/program';
import { programService } from '../../services/programService';
import { useToast } from 'vue-toastification';

const props = defineProps<{
  program: Program;
}>();

const emit = defineEmits<{
  (e: 'update:program', program: Program): void;
}>();

const toast = useToast();
const showCreateVersionModal = ref(false);
const previewVersion = ref<ProgramVersion | null>(null);
const versionForm = ref({
  changeNotes: '',
});

const sortedVersions = computed(() => {
  return [...props.program.versionHistory].sort((a, b) => b.version - a.version);
});

const isValid = computed(() => {
  return versionForm.value.changeNotes.trim() !== '';
});

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString();
};

const createVersion = async () => {
  try {
    const newVersion: ProgramVersion = {
      id: crypto.randomUUID(),
      version: props.program.version + 1,
      title: props.program.title,
      description: props.program.description,
      modules: [...props.program.modules],
      createdAt: new Date(),
      createdBy: props.program.createdBy,
      status: props.program.status,
      tags: [...props.program.tags],
      difficulty: props.program.difficulty,
      estimatedDuration: props.program.estimatedDuration,
      prerequisites: props.program.prerequisites ? [...props.program.prerequisites] : undefined,
      changeNotes: versionForm.value.changeNotes,
    };

    const updatedProgram = {
      ...props.program,
      version: newVersion.version,
      versionHistory: [...props.program.versionHistory, newVersion],
      currentVersionId: newVersion.id,
    };

    await programService.updateProgram(props.program.id, updatedProgram);
    emit('update:program', updatedProgram);
    closeModal();
    toast.success('New version created successfully');
  } catch (error) {
    toast.error('Failed to create new version');
    console.error(error);
  }
};

const previewVersion = (version: ProgramVersion) => {
  previewVersion.value = version;
};

const restoreVersion = async (version: ProgramVersion) => {
  if (
    confirm('Are you sure you want to restore this version? This will replace the current version.')
  ) {
    try {
      const updatedProgram = {
        ...props.program,
        title: version.title,
        description: version.description,
        modules: [...version.modules],
        status: version.status,
        tags: [...version.tags],
        difficulty: version.difficulty,
        estimatedDuration: version.estimatedDuration,
        prerequisites: version.prerequisites ? [...version.prerequisites] : undefined,
        currentVersionId: version.id,
      };

      await programService.updateProgram(props.program.id, updatedProgram);
      emit('update:program', updatedProgram);
      toast.success('Version restored successfully');
    } catch (error) {
      toast.error('Failed to restore version');
      console.error(error);
    }
  }
};

const deleteVersion = async (version: ProgramVersion) => {
  if (confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
    try {
      const updatedProgram = {
        ...props.program,
        versionHistory: props.program.versionHistory.filter(v => v.id !== version.id),
      };

      await programService.updateProgram(props.program.id, updatedProgram);
      emit('update:program', updatedProgram);
      toast.success('Version deleted successfully');
    } catch (error) {
      toast.error('Failed to delete version');
      console.error(error);
    }
  }
};

const closeModal = () => {
  showCreateVersionModal.value = false;
  versionForm.value = {
    changeNotes: '',
  };
};
</script>

<style scoped>
.version-manager {
  padding: 1rem;
}

.version-manager__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.version-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.version-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.version-item__header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-item__meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.version-number {
  font-weight: bold;
  color: #495057;
}

.version-date {
  color: #6c757d;
}

.version-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.version-status.draft {
  background: #e9ecef;
  color: #495057;
}

.version-status.published {
  background: #d4edda;
  color: #155724;
}

.version-status.template {
  background: #cce5ff;
  color: #004085;
}

.version-item__actions {
  display: flex;
  gap: 0.5rem;
}

.version-item__content {
  padding: 1rem;
}

.version-notes {
  margin-bottom: 1rem;
}

.version-notes h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.version-stats {
  display: flex;
  gap: 1rem;
  color: #6c757d;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.version-preview {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.preview-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-item label {
  font-weight: 500;
  color: #495057;
}

.version-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.comparison-section {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.comparison-section h4 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.comparison-content {
  display: grid;
  gap: 1rem;
}

.comparison-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comparison-item label {
  font-weight: 500;
  color: #495057;
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
