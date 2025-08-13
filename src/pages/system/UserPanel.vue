<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import UserProfileCard from '../../components/system/userPanel/UserProfileCard.vue';
import UserTimelineCard from '../../components/system/userPanel/UserTimelineCard.vue';
import UserCareerPlanCard from '../../components/system/userPanel/UserCareerPlanCard.vue';
import UserCareerPathTimeline from '../../components/system/userPanel/UserCareerPathTimeline.vue'; // Importe o novo componente
import { getUserById, type User } from '@/types/teamPanel/project-mocks.type';
import CareerPlanTeste from '../../components/system/userPanel/CareerPlanTeste.vue';

const route = useRoute();
const userUuid = ref<string | string[] | null>(null);
const currentUser = ref<User | undefined>(undefined);

const showDRDCard = ref(false);

// Função para carregar o usuário com base no UUID da rota
const loadUser = (uuid: string) => {
  currentUser.value = getUserById(uuid);
};

// Monitora as mudanças na rota para carregar o usuário correto
watch(
  () => route.params.uuid,
  (newUuid) => {
    if (newUuid) {
      userUuid.value = newUuid;
      loadUser(newUuid as string); // Converte para string para usar na função
    }
  },
  { immediate: true } // Carrega o usuário na montagem inicial do componente
);

// Título dinâmico do painel
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

    <v-row>
      <v-col cols="12">
        <v-card>
          <CareerPlanTeste />
        </v-card>
      </v-col>
    </v-row>
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
  max-height: 500px; /* Um valor alto o suficiente para o card */
  opacity: 1;
}
</style>