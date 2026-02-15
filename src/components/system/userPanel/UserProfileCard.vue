<script setup lang="ts">
import { computed } from 'vue';
import type { UserPanel } from '@/types/user/user-panel.type';

const props = defineProps<{
  user: UserPanel;
}>();

const avatarSrc = computed(() => props.user.profile_img_url ?? null);

const avatarInitial = computed(() => {
  const name = props.user.name?.trim() || '';
  const parts = name.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '?';
});

const jobTitle = computed(() => props.user.jobPosition?.title ?? '-');

const levelsGroupName = computed(() => props.user.jobPosition?.levelsGroup?.name ?? null);
</script>

<template>
  <v-card elevation="2" class="pa-4 user-profile-card" style="height: fit-content;">
    <div class="d-flex flex-column align-center mb-4">
      <v-avatar size="100" class="mb-3" color="primary">
        <v-img v-if="avatarSrc" :src="avatarSrc" :alt="user.name" cover />
        <span v-else class="text-h4 text-white">{{ avatarInitial }}</span>
      </v-avatar>
      <div class="text-h5 font-weight-bold">{{ user.name }}</div>
      <div class="text-subtitle-1 text-medium-emphasis">{{ jobTitle }}</div>
      <v-chip
        v-if="levelsGroupName"
        color="primary"
        variant="tonal"
        density="compact"
        class="mt-2"
        label
      >
        {{ levelsGroupName }}
      </v-chip>
    </div>

    <v-divider class="mb-4"></v-divider>

    <div v-if="user.jobPosition?.drd" class="d-flex align-center mb-2">
      <v-icon start icon="mdi-star-outline"></v-icon>
      <div class="text-body-2">Escala de avaliação: {{ user.jobPosition.drd.rate }}</div>
    </div>
    <div v-if="user.evaluationsReceived?.length !== undefined" class="d-flex align-center">
      <v-icon start icon="mdi-clipboard-list-outline"></v-icon>
      <div class="text-body-2">{{ user.evaluationsReceived.length }} avaliação(ões) recebida(s)</div>
    </div>
  </v-card>
</template>

<style scoped>
.user-profile-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
