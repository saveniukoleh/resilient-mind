<template>
  <div class="progress-dashboard">
    <div class="progress-dashboard__header">
      <h2>Progress Dashboard</h2>
      <div class="progress-dashboard__actions">
        <button class="btn btn-primary" @click="refreshData">
          <i class="fas fa-sync"></i> Refresh
        </button>
      </div>
    </div>

    <div class="progress-dashboard__content">
      <!-- Progress Report -->
      <ProgressReport :program="program" />

      <!-- Progress Charts -->
      <ProgressCharts :program="program" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Program } from '../../types/program';
import { useToast } from 'vue-toastification';
import ProgressReport from './ProgressReport.vue';
import ProgressCharts from './ProgressCharts.vue';

const props = defineProps<{
  program: Program;
}>();

const toast = useToast();

const refreshData = () => {
  // This would typically trigger a refresh of all child components
  toast.success('Dashboard refreshed');
};

onMounted(() => {
  // Initialize dashboard data
  refreshData();
});
</script>

<style scoped>
.progress-dashboard {
  padding: 2rem;
  background: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.progress-dashboard__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
