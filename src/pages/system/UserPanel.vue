<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import UserProfileCard from '../../components/system/userPanel/UserProfileCard.vue';
import UserPerformanceMetricsCard from '../../components/system/userPanel/UserPerformanceMetricsCard.vue';
import UserCareerPlanCard from '../../components/system/userPanel/UserCareerPlanCard.vue';
import UserCareerPathTimeline from '../../components/system/userPanel/UserCareerPathTimeline.vue';
import { useUserPanelStore } from '@/stores/user-panel.store';
import type { UserPanel } from '@/types/user/user-panel.type';

const route = useRoute();

const userPanelStore = useUserPanelStore();

const userUuid = ref<string | string[] | null>(null);
const currentUser = ref<UserPanel | null>(null);

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
</script>

<template>
  <v-container fluid>
    <h2 class="mb-3">Painel do Colaborador: <span style="font-weight: 500;">{{ panelTitle }}</span></h2>

    <v-row dense class="mb-6" v-if="currentUser">
      <v-col cols="12" md="4">
        <UserProfileCard :user="currentUser" />
      </v-col>
      <v-col cols="12" md="8">
        <UserPerformanceMetricsCard :user="currentUser" />
      </v-col>
    </v-row>

    <v-row v-if="currentUser">
      <v-col cols="12">
        <UserCareerPathTimeline :user="currentUser" />
      </v-col>
    </v-row>

    <Transition name="expand">
      <v-row ref="drdCardRef">
        <v-col cols="12">
          <UserCareerPlanCard :user="currentUser" />
        </v-col>
      </v-row>
    </Transition>
  </v-container>
</template>
