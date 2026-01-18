<script setup lang="ts">
import { watch, ref, computed } from 'vue';
import { EvaluationType } from '@/types/evaluationApplication/evaluation-application.type';
import { type CreateEvaluationApplication, type EvaluationApplicationPayload } from '@/types/evaluationApplication/evaluation-application-payload.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useSnackbarStore } from '@/stores/snackbar.store';

const accountUserStore = useAccountUserStore();
const snackbarStore = useSnackbarStore();

const props = defineProps<{
  evaluatedUuids: string[];
}>();

const emit = defineEmits<{
  'update:applications': [applications: CreateEvaluationApplication[]];
  'update:applicationsGrouped': [applicationsGrouped: CreateEvaluationApplication[][]];
}>();

const applicationTypeOptions = [
  { title: 'Autoavaliação', value: EvaluationType.SELF },
  { title: 'Avaliação por Pares', value: EvaluationType.PEER },
  { title: 'Avaliação por Líder', value: EvaluationType.LEADER },
  { title: 'Avaliação por Liderado', value: EvaluationType.SUBORDINATE },
];

/**
 * Adiciona uma aplicação de avaliação ao payload, garantindo que não haja duplicação.
 */
const addUniqueApplication = (
  applications: EvaluationApplicationPayload['applications'],
  keySet: Set<string>,
  submittingUuid: string,
  evaluatedUuid: string,
  type: EvaluationType
) => {
  const key = `${submittingUuid}|${evaluatedUuid}|${type}`;

  if (!applications || keySet.has(key)) {
    return;
  }

  if (submittingUuid === evaluatedUuid && type !== EvaluationType.SELF) {
    return;
  }

  const submittingUser = accountUserStore.accountUsersOptionsTeams.find(user => user.value === submittingUuid) || null;
  const evaluatedUser = accountUserStore.accountUsersOptionsTeams.find(user => user.value === evaluatedUuid) || null;

  if (!submittingUser || !evaluatedUser) {
    console.warn(`Usuário não encontrado para Avaliador (${submittingUuid}) ou Avaliado (${evaluatedUuid})`);
    return;
  }

  applications.push({
    type: type,
    evaluated_user_uuid: evaluatedUuid,
    evaluated_user: {uuid: evaluatedUser.value, profile_img_url: evaluatedUser.avatar, name: evaluatedUser.title, email: ''}, 
    submitting_user_uuid: submittingUuid,
    submitting_user: {uuid: submittingUser.value, profile_img_url: submittingUser.avatar, name: submittingUser.title, email: ''}
  });
  keySet.add(key);
};


// Estado interno para armazenar aplicações agrupadas
const applicationsGroupedByEvaluated = ref<CreateEvaluationApplication[][]>([]);

// Watch para gerar aplicações quando evaluatedUuids mudar
watch(() => props.evaluatedUuids, (newUuids) => {
  if (!newUuids || newUuids.length === 0) {
    applicationsGroupedByEvaluated.value = [];
    emit('update:applications', []);
    emit('update:applicationsGrouped', []);
    return;
  }

  const combinedApplications: EvaluationApplicationPayload['applications'] = [];
  const uniqueRelations = new Set<string>();

  newUuids.forEach(evaluatedUserUuid => {
    const evaluatedUser = accountUserStore.accountUsersOptionsTeams.find(
      user => user.value === evaluatedUserUuid
    );

    if (!evaluatedUser) {
      console.error(`Dados do usuário avaliado ${evaluatedUserUuid} não encontrados no store.`);
      return;
    }

    const teams = evaluatedUser.teams;

    if (!teams || teams.length === 0) {
      console.warn(`Nenhuma relação de time encontrada para ${evaluatedUser.title}.`);
    }

    // 1. Autoavaliação (Self)
    addUniqueApplication(
      combinedApplications,
      uniqueRelations,
      evaluatedUserUuid,
      evaluatedUserUuid,
      EvaluationType.SELF
    );

    teams.forEach(team => {
      const teamMembersUuids = team.teamMembers.map(tm => tm.user.uuid);
      const leaderUuid = team.leader.uuid;
      
      const staffMembersUuids = teamMembersUuids.filter(uuid => uuid !== leaderUuid);

      // --- A. CENÁRIO: O AVALIADO É O LÍDER ---
      if (evaluatedUserUuid === leaderUuid) {
        // Se eu sou o líder, todos os membros do time (staff) são meus SUBORDINADOS
        staffMembersUuids.forEach(subordinateUuid => {
          addUniqueApplication(
            combinedApplications,
            uniqueRelations,
            subordinateUuid,
            evaluatedUserUuid,
            EvaluationType.SUBORDINATE
          );
        });
      } 
      
      // --- B. CENÁRIO: O AVALIADO É UM MEMBRO (STAFF) ---
      else if (staffMembersUuids.includes(evaluatedUserUuid)) {
        
        // 1. O líder do time avalia o membro como LÍDER (Downward)
        addUniqueApplication(
          combinedApplications,
          uniqueRelations,
          leaderUuid,
          evaluatedUserUuid,
          EvaluationType.LEADER
        );

        // 2. Os outros membros do staff avaliam como PAR (Peer)
        staffMembersUuids.forEach(peerUuid => {
          // Só adiciona se for outro membro, diferente de mim mesmo
          if (peerUuid !== evaluatedUserUuid) {
            addUniqueApplication(
              combinedApplications,
              uniqueRelations,
              peerUuid,
              evaluatedUserUuid,
              EvaluationType.PEER
            );
          }
        });
      }
    });
  });

  const applicationsArray = combinedApplications || [];
  emit('update:applications', applicationsArray);

  const grouped = newUuids.map(userUuid => {
    return applicationsArray.filter(app => app.evaluated_user_uuid === userUuid);
  });
  applicationsGroupedByEvaluated.value = grouped;
  emit('update:applicationsGrouped', grouped);

  const usersWithoutTeams = newUuids.filter(uuid => {
    const user = accountUserStore.accountUsersOptionsTeams.find(u => u.value === uuid);
    return user && (!user.teams || user.teams.length === 0);
  });

  if (usersWithoutTeams.length > 0) {
    const names = usersWithoutTeams
      .map(uuid => accountUserStore.accountUsersOptionsTeams.find(u => u.value === uuid)?.title)
      .join(', ');
    snackbarStore.show(`Usuário(s) sem time (${names}) não geraram todas as relações 360.`, 'warning');
  }
}, { immediate: true, deep: true });
</script>

<template>
  <v-card 
    v-for="evaluatedApplications in applicationsGroupedByEvaluated" 
    :key="evaluatedApplications[0]?.evaluated_user?.uuid || evaluatedApplications[0]?.evaluated_user_uuid"
    variant="outlined" 
    class="pa-4 border mb-2"
  >
    <p class="font-weight-medium mb-2">
      Aplicações Geradas para <b>{{ evaluatedApplications[0].evaluated_user?.name }}</b> :
    </p>
    <v-list density="compact" class="bg-transparent">
      <v-list-item v-for="(app, index) in evaluatedApplications" :key="index" class="py-1">
        <template #prepend>
          <v-icon color="primary" size="small">mdi-file-document</v-icon>
        </template>
        <v-list-item-title class="text-caption">
          <span class="font-weight-bold">{{ app.submitting_user?.name }}</span> 
          ({{ applicationTypeOptions.find(opt => opt.value === app.type)?.title }}) 
          avaliando 
          <span class="font-weight-bold">{{ app.evaluated_user?.name }}</span>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>
