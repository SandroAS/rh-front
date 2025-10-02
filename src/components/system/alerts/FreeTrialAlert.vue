<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/auth.store';
import TrialExpiredModal from './TrialExpiredModal.vue';

const props = defineProps<{
  isMobile: boolean
}>()

const userStore = useUserStore();
const currentUser = userStore.currentUser;

const isTrialActive = computed(() => { // validar dp com assinatura tb
  const trial = currentUser?.account?.lastTrial;
  if (trial && trial.ended_at) {
    const endDate = new Date(trial.ended_at);
    const now = new Date();
    return endDate.getTime() >= now.getTime();
  }
  return false;
});

const hasTrialExpired = computed(() => {
  const trial = currentUser?.account?.lastTrial;
  if (trial && trial.ended_at) {
    const endDate = new Date(trial.ended_at);
    const now = new Date();
    return endDate.getTime() < now.getTime();
  }
  return false;
});

const trialDaysLeft = computed(() => {
  const trial = currentUser?.account?.lastTrial;
  if (isTrialActive.value && trial?.ended_at) {
    const endDate = new Date(trial.ended_at);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    // Arredonda para cima para incluir o dia atual se ainda não terminou
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

const showTrialExpiredModal = ref(false);

const openTrialExpiredModal = () => {
  showTrialExpiredModal.value = true;
};

const closeTrialExpiredModal = () => {
  showTrialExpiredModal.value = false;
};

watch([hasTrialExpired, () => userStore.isLoggedIn], ([newHasTrialExpired, newIsLoggedIn]) => {
  if (newHasTrialExpired && newIsLoggedIn) {
    openTrialExpiredModal();
  } else {
    closeTrialExpiredModal();
  }
}, { immediate: true });
</script>

<template>
  <div v-if="isTrialActive" class="v-toolbar v-toolbar--density-compact bg-white">
    <v-alert
      type="warning"
      class="rounded-0 w-100"
      border="bottom"
      density="compact"
      variant="tonal"
    >
      <div
        class="d-flex align-center justify-space-between flex-wrap"
        :class="{ 'flex-column': props.isMobile }"
      >
        <span v-if="trialDaysLeft > 0" :class="{'mb-2': props.isMobile}">
          Você está em período de avaliação gratuita, finaliza em
          <strong>{{ trialDaysLeft }}</strong> dias.
        </span>
        <span v-else>
          Seu período de avaliação chegou ao fim, espero ter aproveitado!
        </span>

        <v-btn
          color="warning"
          variant="flat"
          class="text-no-wrap"
          :class="props.isMobile ? 'w-100' : 'ml-4'"
          size="small"
          @click="showTrialExpiredModal = true"
        >
          Assinar agora
        </v-btn>
      </div>
    </v-alert>
  </div>

  <TrialExpiredModal v-model="showTrialExpiredModal" :hasTrialExpired="hasTrialExpired"/>
</template>
