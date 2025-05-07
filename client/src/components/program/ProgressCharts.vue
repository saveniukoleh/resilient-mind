<template>
  <div class="progress-charts">
    <div class="progress-charts__header">
      <h2>Progress Analytics</h2>
      <div class="progress-charts__actions">
        <select v-model="timeRange" class="progress-charts__select">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
    </div>

    <div class="progress-charts__grid">
      <!-- Progress Over Time Chart -->
      <div class="progress-charts__card">
        <h3>Progress Over Time</h3>
        <canvas ref="progressChart"></canvas>
      </div>

      <!-- Module Completion Chart -->
      <div class="progress-charts__card">
        <h3>Module Completion</h3>
        <canvas ref="moduleChart"></canvas>
      </div>

      <!-- Time Spent Distribution -->
      <div class="progress-charts__card">
        <h3>Time Spent by Module</h3>
        <canvas ref="timeChart"></canvas>
      </div>

      <!-- Achievement Progress -->
      <div class="progress-charts__card">
        <h3>Achievement Progress</h3>
        <canvas ref="achievementChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, ChartConfiguration } from 'chart.js';
import { Program } from '../../types/program';
import { progressService } from '../../services/progressService';
import { useAuth } from '../../composables/useAuth';

const props = defineProps<{
  program: Program;
}>();

const { user } = useAuth();
const timeRange = ref('7');

// Chart references
const progressChart = ref<HTMLCanvasElement | null>(null);
const moduleChart = ref<HTMLCanvasElement | null>(null);
const timeChart = ref<HTMLCanvasElement | null>(null);
const achievementChart = ref<HTMLCanvasElement | null>(null);

// Chart instances
let progressChartInstance: Chart | null = null;
let moduleChartInstance: Chart | null = null;
let timeChartInstance: Chart | null = null;
let achievementChartInstance: Chart | null = null;

// Load and render charts
const loadCharts = async () => {
  if (!user.value) return;

  try {
    // Load progress data
    const progressData = await loadProgressData();
    renderProgressChart(progressData);

    // Load module completion data
    const moduleData = await loadModuleData();
    renderModuleChart(moduleData);

    // Load time distribution data
    const timeData = await loadTimeData();
    renderTimeChart(timeData);

    // Load achievement data
    const achievementData = await loadAchievementData();
    renderAchievementChart(achievementData);
  } catch (error) {
    console.error('Failed to load chart data:', error);
  }
};

// Load progress data over time
const loadProgressData = async () => {
  // This would typically come from a progress service
  // For now, we'll create sample data
  const days = parseInt(timeRange.value);
  const data = [];
  const labels = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString());
    data.push(Math.floor(Math.random() * 100));
  }

  return { labels, data };
};

// Load module completion data
const loadModuleData = async () => {
  const modules = props.program.modules;
  const completed = await Promise.all(
    modules.map(async module => {
      if (!user.value) return 0;
      return progressService.getCompletedContentCount(user.value.uid, props.program.id, module.id);
    })
  );

  return {
    labels: modules.map(m => m.title),
    data: completed,
    total: modules.map(m => m.content.length),
  };
};

// Load time distribution data
const loadTimeData = async () => {
  const modules = props.program.modules;
  const timeData = modules.map(() => Math.floor(Math.random() * 120)); // Mock data

  return {
    labels: modules.map(m => m.title),
    data: timeData,
  };
};

// Load achievement data
const loadAchievementData = async () => {
  if (!user.value) return { labels: [], data: [] };

  const achievements = await progressService.getAchievements(user.value.uid, props.program.id);

  return {
    labels: ['Earned', 'Available'],
    data: [achievements.length, 10 - achievements.length], // Assuming 10 total achievements
  };
};

// Render progress over time chart
const renderProgressChart = (data: { labels: string[]; data: number[] }) => {
  if (!progressChart.value) return;

  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Progress (%)',
          data: data.data,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  };

  if (progressChartInstance) {
    progressChartInstance.destroy();
  }
  progressChartInstance = new Chart(progressChart.value, config);
};

// Render module completion chart
const renderModuleChart = (data: { labels: string[]; data: number[]; total: number[] }) => {
  if (!moduleChart.value) return;

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Completed',
          data: data.data,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Total',
          data: data.total,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  if (moduleChartInstance) {
    moduleChartInstance.destroy();
  }
  moduleChartInstance = new Chart(moduleChart.value, config);
};

// Render time distribution chart
const renderTimeChart = (data: { labels: string[]; data: number[] }) => {
  if (!timeChart.value) return;

  const config: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [
        {
          data: data.data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
        },
      ],
    },
    options: {
      responsive: true,
    },
  };

  if (timeChartInstance) {
    timeChartInstance.destroy();
  }
  timeChartInstance = new Chart(timeChart.value, config);
};

// Render achievement progress chart
const renderAchievementChart = (data: { labels: string[]; data: number[] }) => {
  if (!achievementChart.value) return;

  const config: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: data.labels,
      datasets: [
        {
          data: data.data,
          backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        },
      ],
    },
    options: {
      responsive: true,
    },
  };

  if (achievementChartInstance) {
    achievementChartInstance.destroy();
  }
  achievementChartInstance = new Chart(achievementChart.value, config);
};

// Watch for time range changes
watch(timeRange, () => {
  loadCharts();
});

// Initialize charts
onMounted(() => {
  loadCharts();
});
</script>

<style scoped>
.progress-charts {
  padding: 2rem;
  background: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-charts__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.progress-charts__select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-surface-variant);
  background: var(--color-surface);
  color: var(--color-text);
}

.progress-charts__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.progress-charts__card {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.progress-charts__card h3 {
  margin-bottom: 1rem;
  color: var(--color-text);
}

canvas {
  width: 100% !important;
  height: 300px !important;
}
</style>
