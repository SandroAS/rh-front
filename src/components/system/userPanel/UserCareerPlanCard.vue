<script setup lang="ts">
import type { CareerLevel, User } from '@/types/teamPanel/project-mocks.type';
import { computed } from 'vue';

const props = defineProps<{
  user: User;
}>();

const currentLevelData = computed<CareerLevel | undefined>(() => {
  return props.user.careerPlan.levels.find(level => level.level === props.user.careerPlan.currentLevel);
});

const getStepperIcon = (level: number) => {
  if (level === props.user.careerPlan.currentLevel) {
    return 'mdi-star'; // Ícone para o nível atual
  } else if (level < props.user.careerPlan.currentLevel) {
    return 'mdi-check-circle-outline'; // Ícone para níveis passados
  } else {
    return 'mdi-circle-outline'; // Ícone para níveis futuros
  }
};

const getStepperColor = (level: number) => {
  if (level === props.user.careerPlan.currentLevel) {
    return 'primary';
  } else if (level < props.user.careerPlan.currentLevel) {
    return 'success';
  } else {
    return 'grey';
  }
};
</script>

<template>
  <v-card elevation="2" class="pa-4 user-career-plan-card">
    <v-card-title class="text-h6 font-weight-bold">Plano de Carreira</v-card-title>
    <v-divider class="mb-4"></v-divider>

    <div class="mb-4">
      <div class="text-subtitle-1 font-weight-bold">Posição Atual:</div>
      <div class="text-h5 text-primary">{{ user.careerPlan.currentPosition }}</div>
    </div>

    <v-stepper :model-value="user.careerPlan.currentLevel" flat class="pa-0">
      <v-stepper-item
        v-for="levelData in user.careerPlan.levels"
        :key="levelData.level"
        :value="levelData.level"
        :title="levelData.position"
        :icon="getStepperIcon(levelData.level)"
        :color="getStepperColor(levelData.level)"
        editable
        @click="user.careerPlan.currentLevel = levelData.level"
      >
        <v-card class="mt-2" flat border>
          <v-card-text>
            <div class="font-weight-medium mb-2">{{ levelData.description }}</div>
            <v-expansion-panels flat>
              <v-expansion-panel
                title="Habilidades Necessárias"
              >
                <template v-slot:text>
                  <v-chip
                    v-for="skill in levelData.skillsRequired"
                    :key="skill"
                    class="ma-1"
                    color="blue-grey"
                    variant="tonal"
                    size="small"
                  >{{ skill }}</v-chip>
                </template>
              </v-expansion-panel>

              <v-expansion-panel
                title="Conquistas Requeridas"
                class="mt-2"
              >
                <template v-slot:text>
                  <v-list density="compact">
                    <v-list-item v-for="achievement in levelData.achievementsRequired" :key="achievement">
                      <v-list-item-title class="text-caption">{{ achievement }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </template>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-stepper-item>
    </v-stepper>
  </v-card>
</template>

<style scoped>
.user-career-plan-card .v-stepper {
  background-color: transparent !important;
}

.user-career-plan-card .v-stepper-item--selected .v-stepper-item__header {
  font-weight: bold;
}
</style>
