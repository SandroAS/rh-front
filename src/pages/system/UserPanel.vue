<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import UserProfileCard from '../../components/system/userPanel/UserProfileCard.vue';
import UserTimelineCard from '../../components/system/userPanel/UserTimelineCard.vue';
import UserCareerPlanCard from '../../components/system/userPanel/UserCareerPlanCard.vue';
import UserCareerPathTimeline from '../../components/system/userPanel/UserCareerPathTimeline.vue'; // Importe o novo componente
import { useUserPanelStore } from '@/stores/user-panel.store';
import type { UserPanel } from '@/types/user/user-panel.type';

const route = useRoute();

const userPanelStore = useUserPanelStore();

const userUuid = ref<string | string[] | null>(null);
const currentUser = ref<UserPanel | null>(null);

const showDRDCard = ref(false);

const loadUser = async () => {
  currentUser.value = await userPanelStore.getUserPanel(userUuid.value as string);
};

watch(
  () => route.params.uuid,
  (newUuid) => {
    if (newUuid) {
      userUuid.value = newUuid;
      loadUser();
    }
  },
  { immediate: true }
);

const panelTitle = computed(() => {
  return currentUser.value ? currentUser.value.name : 'Colaborador';
});

const drdCardRef = ref<HTMLElement | null>(null);

function clickProgressBar(step: any) {
  showDRDCard.value = true;

  setTimeout(() => {
    if (drdCardRef.value) {
      window.scrollTo({
        top: 800,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, 200);
}
</script>

<template>
  <v-container fluid>
    <h2 class="mb-3">Painel do Colaborador: <span style="font-weight: 500;">{{ panelTitle }}</span></h2>

    <v-row dense class="mb-6" v-if="currentUser">
      <v-col cols="12" md="4">
        <UserProfileCard :user="currentUser" />
      </v-col>
      <v-col cols="12" md="8">
        <UserTimelineCard :user="currentUser" />
      </v-col>
    </v-row>

    <v-row v-if="currentUser">
      <v-col cols="12">
        <UserCareerPathTimeline :user="currentUser" @progressbar="clickProgressBar"/>
      </v-col>
    </v-row>

    <Transition name="expand">
      <v-row v-if="currentUser && showDRDCard" ref="drdCardRef">
        <v-col cols="12">
          <UserCareerPlanCard :user="currentUser" />
        </v-col>
      </v-row>
    </Transition>
  </v-container>
</template>

<style scoped>
/* Estilos para a animação de expansão */
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.5s ease-in-out;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>