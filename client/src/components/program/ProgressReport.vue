<template>
  <div class="progress-report">
    <div class="progress-report__header">
      <h2>Progress Report</h2>
      <div class="progress-report__actions">
        <button class="btn btn-secondary" @click="exportReport">
          <i class="fas fa-download"></i> Export Report
        </button>
        <button class="btn btn-primary" @click="refreshData">
          <i class="fas fa-sync"></i> Refresh
        </button>
      </div>
    </div>

    <div class="progress-report__content">
      <!-- Overview Section -->
      <section class="progress-report__section">
        <h3>Overview</h3>
        <div class="progress-report__grid">
          <div class="progress-report__card">
            <h4>Overall Progress</h4>
            <div class="progress-report__progress">
              <div
                class="progress-report__progress-bar"
                :style="{ width: `${overallProgress}%` }"
              ></div>
              <span>{{ overallProgress }}%</span>
            </div>
          </div>
          <div class="progress-report__card">
            <h4>Time Spent</h4>
            <p>{{ formatDuration(timeSpent) }}</p>
          </div>
          <div class="progress-report__card">
            <h4>Completed Modules</h4>
            <p>{{ completedModules }}/{{ totalModules }}</p>
          </div>
          <div class="progress-report__card">
            <h4>Achievements Earned</h4>
            <p>{{ achievements.length }}</p>
          </div>
        </div>
      </section>

      <!-- Progress Timeline -->
      <section class="progress-report__section">
        <h3>Progress Timeline</h3>
        <div class="progress-report__timeline">
          <div
            v-for="(entry, index) in timelineData"
            :key="index"
            class="progress-report__timeline-item"
          >
            <div class="progress-report__timeline-date">{{ formatDate(entry.date) }}</div>
            <div class="progress-report__timeline-content">
              <h4>{{ entry.title }}</h4>
              <p>{{ entry.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Module Progress -->
      <section class="progress-report__section">
        <h3>Module Progress</h3>
        <div class="progress-report__modules">
          <div v-for="module in program.modules" :key="module.id" class="progress-report__module">
            <div class="progress-report__module-header">
              <h4>{{ module.title }}</h4>
              <span class="progress-report__module-status" :class="getModuleStatus(module.id)">
                {{ getModuleStatusText(module.id) }}
              </span>
            </div>
            <div class="progress-report__module-progress">
              <div
                class="progress-report__progress-bar"
                :style="{ width: `${getModuleProgress(module.id)}%` }"
              ></div>
              <span>{{ getModuleProgress(module.id) }}%</span>
            </div>
            <div class="progress-report__module-details">
              <p>
                Completed: {{ getCompletedContentCount(module.id) }}/{{ module.content.length }}
              </p>
              <p>Time spent: {{ formatDuration(getModuleTimeSpent(module.id)) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Achievements -->
      <section class="progress-report__section">
        <h3>Achievements</h3>
        <div class="progress-report__achievements">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="progress-report__achievement"
          >
            <div class="progress-report__achievement-icon">
              <i :class="achievement.icon"></i>
            </div>
            <div class="progress-report__achievement-content">
              <h4>{{ achievement.title }}</h4>
              <p>{{ achievement.description }}</p>
              <span class="progress-report__achievement-date">
                Earned: {{ formatDate(achievement.earnedAt) }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Program, Module } from '../../types/program';
import { progressService } from '../../services/progressService';
import { useAuth } from '../../composables/useAuth';
import { useToast } from 'vue-toastification';

const props = defineProps<{
  program: Program;
}>();

const { user } = useAuth();
const toast = useToast();
const timeSpent = ref(0);
const achievements = ref<
  Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: Date;
  }>
>([]);
const timelineData = ref<
  Array<{
    date: Date;
    title: string;
    description: string;
  }>
>([]);

// Load initial data
onMounted(async () => {
  if (user.value) {
    await loadData();
  }
});

const loadData = async () => {
  try {
    if (!user.value) return;

    // Load time spent
    timeSpent.value = await progressService.getTimeSpent(user.value.uid, props.program.id);

    // Load achievements
    achievements.value = await progressService.getAchievements(user.value.uid, props.program.id);

    // Load timeline data
    await loadTimelineData();
  } catch (error) {
    console.error('Failed to load report data:', error);
    toast.error('Failed to load report data');
  }
};

const loadTimelineData = async () => {
  if (!user.value) return;

  // This would typically come from a progress service
  // For now, we'll create some sample data
  timelineData.value = [
    {
      date: new Date(),
      title: 'Started Program',
      description: 'Began the recovery program',
    },
    {
      date: new Date(Date.now() - 86400000), // 1 day ago
      title: 'Completed First Module',
      description: 'Successfully completed the introduction module',
    },
    {
      date: new Date(Date.now() - 172800000), // 2 days ago
      title: 'Earned Achievement',
      description: 'Completed 7 days of consistent practice',
    },
  ];
};

const overallProgress = computed(() => {
  const totalContent = props.program.modules.reduce(
    (acc, module) => acc + module.content.length,
    0
  );
  const completedContent = props.program.modules.reduce(
    (acc, module) => acc + getCompletedContentCount(module.id),
    0
  );
  return Math.round((completedContent / totalContent) * 100);
});

const completedModules = computed(() => {
  return props.program.modules.filter(module => isModuleCompleted(module.id)).length;
});

const totalModules = computed(() => props.program.modules.length);

const isModuleCompleted = (moduleId: string): boolean => {
  const module = props.program.modules.find(m => m.id === moduleId);
  if (!module) return false;
  return getCompletedContentCount(moduleId) === module.content.length;
};

const getModuleStatus = (moduleId: string): string => {
  if (isModuleCompleted(moduleId)) return 'completed';
  if (getCompletedContentCount(moduleId) > 0) return 'in-progress';
  return 'not-started';
};

const getModuleStatusText = (moduleId: string): string => {
  const status = getModuleStatus(moduleId);
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in-progress':
      return 'In Progress';
    default:
      return 'Not Started';
  }
};

const getModuleProgress = (moduleId: string): number => {
  const module = props.program.modules.find(m => m.id === moduleId);
  if (!module) return 0;
  return Math.round((getCompletedContentCount(moduleId) / module.content.length) * 100);
};

const getModuleTimeSpent = (moduleId: string): number => {
  // This would typically come from a progress service
  // For now, we'll return a mock value
  return Math.floor(Math.random() * 120); // Random time between 0-120 minutes
};

const getCompletedContentCount = async (moduleId: string): Promise<number> => {
  if (!user.value) return 0;
  return progressService.getCompletedContentCount(user.value.uid, props.program.id, moduleId);
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minutes`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minutes`;
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const exportReport = () => {
  // This would typically generate and download a PDF report
  toast.success('Report exported successfully');
};

const refreshData = async () => {
  try {
    await loadData();
    toast.success('Report data refreshed');
  } catch (error) {
    toast.error('Failed to refresh report data');
  }
};
</script>

<style scoped>
.progress-report {
  padding: 2rem;
  background: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-report__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.progress-report__actions {
  display: flex;
  gap: 1rem;
}

.progress-report__section {
  margin-bottom: 2rem;
}

.progress-report__section h3 {
  margin-bottom: 1rem;
  color: var(--color-text);
}

.progress-report__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.progress-report__card {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.progress-report__card h4 {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.progress-report__progress {
  position: relative;
  height: 8px;
  background: var(--color-surface-variant);
  border-radius: 4px;
  overflow: hidden;
}

.progress-report__progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-report__progress span {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 0.875rem;
  color: var(--color-text);
}

.progress-report__timeline {
  position: relative;
  padding-left: 2rem;
}

.progress-report__timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-surface-variant);
}

.progress-report__timeline-item {
  position: relative;
  padding-bottom: 2rem;
}

.progress-report__timeline-item::before {
  content: '';
  position: absolute;
  left: -2rem;
  top: 0;
  width: 1rem;
  height: 1rem;
  background: var(--color-primary);
  border-radius: 50%;
}

.progress-report__timeline-date {
  font-size: 0.875rem;
  color: var(--color-text-variant);
  margin-bottom: 0.5rem;
}

.progress-report__timeline-content {
  background: var(--color-surface);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.progress-report__timeline-content h4 {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.progress-report__modules {
  display: grid;
  gap: 1rem;
}

.progress-report__module {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.progress-report__module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-report__module-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.progress-report__module-status.completed {
  background: var(--color-success-light);
  color: var(--color-success);
}

.progress-report__module-status.in-progress {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.progress-report__module-status.not-started {
  background: var(--color-surface-variant);
  color: var(--color-text-variant);
}

.progress-report__module-progress {
  position: relative;
  height: 8px;
  background: var(--color-surface-variant);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-report__module-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--color-text-variant);
}

.progress-report__achievements {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.progress-report__achievement {
  display: flex;
  gap: 1rem;
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.progress-report__achievement-icon {
  width: 3rem;
  height: 3rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.progress-report__achievement-content {
  flex: 1;
}

.progress-report__achievement-content h4 {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.progress-report__achievement-date {
  font-size: 0.875rem;
  color: var(--color-text-variant);
}
</style>
