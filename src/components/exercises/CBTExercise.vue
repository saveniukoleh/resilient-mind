<template>
  <div class="cbt-exercise">
    <div class="exercise-header">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">{{ currentTechnique.title }}</h2>
      <p class="text-gray-600">{{ currentTechnique.description }}</p>
    </div>

    <!-- Thought Record Exercise -->
    <div v-if="currentTechnique.id === 'thought-record'" class="thought-record">
      <div class="form-group">
        <label>Situation</label>
        <textarea
          v-model="thoughtRecord.situation"
          class="form-control"
          rows="3"
          placeholder="Describe the situation that triggered your thoughts..."
        ></textarea>
      </div>

      <div class="form-group">
        <label>Automatic Thoughts</label>
        <textarea
          v-model="thoughtRecord.automaticThoughts"
          class="form-control"
          rows="3"
          placeholder="What thoughts went through your mind?"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Emotions</label>
        <div class="emotions-grid">
          <div v-for="emotion in emotions" :key="emotion" class="emotion-item">
            <label class="emotion-label">
              <input
                type="checkbox"
                v-model="thoughtRecord.emotions"
                :value="emotion"
                class="emotion-checkbox"
              />
              {{ emotion }}
            </label>
            <input
              v-if="thoughtRecord.emotions.includes(emotion)"
              type="range"
              v-model="thoughtRecord.emotionIntensities[emotion]"
              min="0"
              max="100"
              class="emotion-intensity"
            />
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Evidence Supporting the Thought</label>
        <textarea
          v-model="thoughtRecord.supportingEvidence"
          class="form-control"
          rows="3"
          placeholder="What evidence supports this thought?"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Evidence Against the Thought</label>
        <textarea
          v-model="thoughtRecord.contradictingEvidence"
          class="form-control"
          rows="3"
          placeholder="What evidence contradicts this thought?"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Alternative Thought</label>
        <textarea
          v-model="thoughtRecord.alternativeThought"
          class="form-control"
          rows="3"
          placeholder="What's a more balanced way of thinking about this?"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Outcome</label>
        <textarea
          v-model="thoughtRecord.outcome"
          class="form-control"
          rows="3"
          placeholder="How do you feel now? What would you do differently next time?"
        ></textarea>
      </div>
    </div>

    <!-- Behavioral Activation Exercise -->
    <div v-if="currentTechnique.id === 'behavioral-activation'" class="behavioral-activation">
      <div class="form-group">
        <label>Current Mood</label>
        <div class="mood-selector">
          <button
            v-for="mood in moods"
            :key="mood.value"
            class="mood-button"
            :class="{ selected: behavioralActivation.currentMood === mood.value }"
            @click="behavioralActivation.currentMood = mood.value"
          >
            {{ mood.label }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>Activities</label>
        <div class="activities-list">
          <div
            v-for="(activity, index) in behavioralActivation.activities"
            :key="index"
            class="activity-item"
          >
            <input
              type="text"
              v-model="activity.name"
              class="form-control"
              placeholder="Enter an activity"
            />
            <div class="activity-controls">
              <label class="activity-label">
                <input type="checkbox" v-model="activity.completed" class="activity-checkbox" />
                Completed
              </label>
              <button class="btn-danger" @click="removeActivity(index)">Remove</button>
            </div>
          </div>
          <button class="btn-secondary" @click="addActivity">Add Activity</button>
        </div>
      </div>

      <div class="form-group">
        <label>Mood After Activities</label>
        <div class="mood-selector">
          <button
            v-for="mood in moods"
            :key="mood.value"
            class="mood-button"
            :class="{ selected: behavioralActivation.moodAfter === mood.value }"
            @click="behavioralActivation.moodAfter = mood.value"
          >
            {{ mood.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Technique Selection -->
    <div class="technique-selection">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Select CBT Technique</h3>
      <div class="technique-buttons">
        <button
          v-for="technique in techniques"
          :key="technique.id"
          class="technique-button"
          :class="{ selected: currentTechnique.id === technique.id }"
          @click="selectTechnique(technique)"
        >
          {{ technique.title }}
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="btn-primary" @click="saveExercise">Save Progress</button>
      <button class="btn-secondary" @click="resetExercise">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Technique {
  id: string;
  title: string;
  description: string;
}

interface ThoughtRecord {
  situation: string;
  automaticThoughts: string;
  emotions: string[];
  emotionIntensities: Record<string, number>;
  supportingEvidence: string;
  contradictingEvidence: string;
  alternativeThought: string;
  outcome: string;
}

interface Activity {
  name: string;
  completed: boolean;
}

interface BehavioralActivation {
  currentMood: number;
  activities: Activity[];
  moodAfter: number;
}

const techniques: Technique[] = [
  {
    id: 'thought-record',
    title: 'Thought Record',
    description:
      'Identify and challenge negative automatic thoughts using evidence-based techniques.',
  },
  {
    id: 'behavioral-activation',
    title: 'Behavioral Activation',
    description:
      'Track your activities and mood to identify patterns and increase engagement in positive activities.',
  },
];

const emotions = [
  'Anxiety',
  'Depression',
  'Anger',
  'Sadness',
  'Fear',
  'Guilt',
  'Shame',
  'Frustration',
  'Worry',
  'Hopelessness',
];

const moods = [
  { value: 1, label: '😢 Very Low' },
  { value: 2, label: '😕 Low' },
  { value: 3, label: '😐 Neutral' },
  { value: 4, label: '🙂 Good' },
  { value: 5, label: '😊 Very Good' },
];

const currentTechnique = ref<Technique>(techniques[0]);
const thoughtRecord = ref<ThoughtRecord>({
  situation: '',
  automaticThoughts: '',
  emotions: [],
  emotionIntensities: {},
  supportingEvidence: '',
  contradictingEvidence: '',
  alternativeThought: '',
  outcome: '',
});

const behavioralActivation = ref<BehavioralActivation>({
  currentMood: 3,
  activities: [],
  moodAfter: 3,
});

const selectTechnique = (technique: Technique) => {
  currentTechnique.value = technique;
};

const addActivity = () => {
  behavioralActivation.value.activities.push({
    name: '',
    completed: false,
  });
};

const removeActivity = (index: number) => {
  behavioralActivation.value.activities.splice(index, 1);
};

const saveExercise = () => {
  // TODO: Implement save functionality
  console.log('Saving exercise progress...');
};

const resetExercise = () => {
  if (currentTechnique.value.id === 'thought-record') {
    thoughtRecord.value = {
      situation: '',
      automaticThoughts: '',
      emotions: [],
      emotionIntensities: {},
      supportingEvidence: '',
      contradictingEvidence: '',
      alternativeThought: '',
      outcome: '',
    };
  } else if (currentTechnique.value.id === 'behavioral-activation') {
    behavioralActivation.value = {
      currentMood: 3,
      activities: [],
      moodAfter: 3,
    };
  }
};
</script>

<style scoped>
.cbt-exercise {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
}

.exercise-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.emotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.emotion-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.emotion-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.emotion-checkbox {
  width: 1rem;
  height: 1rem;
}

.emotion-intensity {
  width: 100%;
}

.mood-selector {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.mood-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.mood-button.selected {
  background: #60a5fa;
  color: white;
  border-color: #60a5fa;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.technique-selection {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.technique-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.technique-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.technique-button.selected {
  background: #60a5fa;
  color: white;
  border-color: #60a5fa;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500;
}

.btn-danger {
  @apply bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500;
}
</style>
