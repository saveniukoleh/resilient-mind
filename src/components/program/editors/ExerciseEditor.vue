<template>
  <div class="exercise-editor">
    <div class="form-group">
      <label>Exercise Title</label>
      <input
        v-model="exercise.title"
        type="text"
        class="form-control"
        placeholder="Enter exercise title"
        @input="updateContent"
      />
    </div>

    <div class="form-group">
      <label>Exercise Type</label>
      <select v-model="exercise.type" class="form-control" @change="updateContent">
        <option value="breathing">Breathing Exercise</option>
        <option value="cbt">CBT Exercise</option>
        <option value="meditation">Meditation</option>
        <option value="journaling">Journaling</option>
      </select>
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea
        v-model="exercise.description"
        class="form-control"
        rows="3"
        placeholder="Enter exercise description"
        @input="updateContent"
      ></textarea>
    </div>

    <div class="form-group">
      <label>Instructions</label>
      <div
        v-for="(instruction, index) in exercise.instructions"
        :key="index"
        class="instruction-item"
      >
        <div class="instruction-input">
          <input
            v-model="exercise.instructions[index]"
            type="text"
            class="form-control"
            :placeholder="`Instruction ${index + 1}`"
            @input="updateContent"
          />
          <button class="btn btn-danger" @click="removeInstruction(index)">Remove</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="addInstruction">Add Instruction</button>
    </div>

    <div class="form-row">
      <div class="form-group col-md-6">
        <label>Duration (minutes)</label>
        <input
          v-model.number="exercise.duration"
          type="number"
          class="form-control"
          min="1"
          @input="updateContent"
        />
      </div>

      <div class="form-group col-md-6">
        <label>Difficulty Level</label>
        <select v-model="exercise.difficulty" class="form-control" @change="updateContent">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Required Materials</label>
      <div v-for="(material, index) in exercise.materials" :key="index" class="material-item">
        <div class="material-input">
          <input
            v-model="exercise.materials[index]"
            type="text"
            class="form-control"
            :placeholder="`Material ${index + 1}`"
            @input="updateContent"
          />
          <button class="btn btn-danger" @click="removeMaterial(index)">Remove</button>
        </div>
      </div>
      <button class="btn btn-secondary" @click="addMaterial">Add Material</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Exercise } from '../../../types/program';

const props = defineProps<{
  modelValue: Exercise;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Exercise): void;
}>();

const exercise = ref<Exercise>({
  id: props.modelValue.id,
  title: props.modelValue.title,
  description: props.modelValue.description,
  type: props.modelValue.type,
  instructions: [...props.modelValue.instructions],
  duration: props.modelValue.duration,
  difficulty: props.modelValue.difficulty,
  materials: props.modelValue.materials ? [...props.modelValue.materials] : [],
});

watch(
  () => props.modelValue,
  newValue => {
    exercise.value = {
      id: newValue.id,
      title: newValue.title,
      description: newValue.description,
      type: newValue.type,
      instructions: [...newValue.instructions],
      duration: newValue.duration,
      difficulty: newValue.difficulty,
      materials: newValue.materials ? [...newValue.materials] : [],
    };
  }
);

const updateContent = () => {
  emit('update:modelValue', { ...exercise.value });
};

const addInstruction = () => {
  exercise.value.instructions.push('');
  updateContent();
};

const removeInstruction = (index: number) => {
  exercise.value.instructions.splice(index, 1);
  updateContent();
};

const addMaterial = () => {
  if (!exercise.value.materials) {
    exercise.value.materials = [];
  }
  exercise.value.materials.push('');
  updateContent();
};

const removeMaterial = (index: number) => {
  if (exercise.value.materials) {
    exercise.value.materials.splice(index, 1);
    updateContent();
  }
};
</script>

<style scoped>
.exercise-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.instruction-item,
.material-item {
  margin-bottom: 0.5rem;
}

.instruction-input,
.material-input {
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}
</style>
