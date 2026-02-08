<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import { EvaluationType } from '@/types/evaluationApplication/evaluation-application.type';
import { type CreateEvaluationApplication, type EvaluationApplicationPayload } from '@/types/evaluationApplication/evaluation-application-payload.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useEvaluationStore } from '@/stores/evaluation.store';

const accountUserStore = useAccountUserStore();
const snackbarStore = useSnackbarStore();
const evaluationStore = useEvaluationStore();

const props = defineProps<{
  evaluatedUuids: string[];
  creationType: 'AUTOMATIC' | 'SELECTED_EVALUATION';
  evaluationUuid?: string;
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
 * Busca a avaliação apropriada baseada no jobPosition do usuário avaliado quando creationType é AUTOMATIC
 */
const findEvaluationForUser = (evaluatedUserUuid: string): string | undefined => {
  if (props.creationType === 'SELECTED_EVALUATION') {
    return props.evaluationUuid;
  }

  // AUTOMATIC: buscar avaliação que tem DRD vinculado ao jobPosition do usuário avaliado
  const evaluatedUser = accountUserStore.accountUsersOptionsTeams.find(
    user => user.value === evaluatedUserUuid
  );

  if (!evaluatedUser?.jobPosition?.uuid) {
    return undefined;
  }

  // Buscar avaliação que tem DRD com jobPosition igual ao do usuário avaliado
  const foundEvaluation = evaluationStore.evaluations_simple?.find(
    evaluation => evaluation.drd?.jobPosition?.uuid === evaluatedUser.jobPosition?.uuid
  );

  return foundEvaluation?.uuid;
};

/**
 * Adiciona uma aplicação de avaliação ao payload, garantindo que não haja duplicação.
 * Retorna true se a aplicação foi adicionada, false caso contrário.
 */
const addUniqueApplication = (
  applications: EvaluationApplicationPayload['applications'],
  keySet: Set<string>,
  submittingUuid: string,
  evaluatedUuid: string,
  type: EvaluationType,
  evaluationUuid?: string
): boolean => {
  const key = `${submittingUuid}|${evaluatedUuid}|${type}`;

  if (!applications || keySet.has(key)) {
    return false;
  }

  if (submittingUuid === evaluatedUuid && type !== EvaluationType.SELF) {
    return false;
  }

  const submittingUser = accountUserStore.accountUsersOptionsTeams.find(user => user.value === submittingUuid) || null;
  const evaluatedUser = accountUserStore.accountUsersOptionsTeams.find(user => user.value === evaluatedUuid) || null;

  if (!submittingUser || !evaluatedUser) {
    console.warn(`Usuário não encontrado para Avaliador (${submittingUuid}) ou Avaliado (${evaluatedUuid})`);
    return false;
  }

  // Determinar evaluation_uuid baseado no creationType
  const finalEvaluationUuid = evaluationUuid || findEvaluationForUser(evaluatedUuid);

  // Se não encontrou avaliação e está no modo AUTOMATIC, não adiciona
  if (!finalEvaluationUuid && props.creationType === 'AUTOMATIC') {
    return false;
  }

  // Se está no modo SELECTED_EVALUATION e não tem evaluationUuid, não adiciona
  if (!finalEvaluationUuid && props.creationType === 'SELECTED_EVALUATION') {
    return false;
  }

  applications.push({
    type: type,
    evaluated_user_uuid: evaluatedUuid,
    evaluated_user: {uuid: evaluatedUser.value, profile_img_url: evaluatedUser.avatar, name: evaluatedUser.title, email: ''}, 
    submitting_user_uuid: submittingUuid,
    submitting_user: {uuid: submittingUser.value, profile_img_url: submittingUser.avatar, name: submittingUser.title, email: ''},
    evaluation_uuid: finalEvaluationUuid
  } as CreateEvaluationApplication & { evaluation_uuid?: string });
  keySet.add(key);
  return true;
};


// Estado interno para armazenar aplicações agrupadas
const applicationsGroupedByEvaluated = ref<CreateEvaluationApplication[][]>([]);

/**
 * Busca o nome da avaliação baseado no evaluation_uuid
 */
const getEvaluationName = (evaluationUuid?: string): string => {
  if (!evaluationUuid) return '';
  const foundEvaluation = evaluationStore.evaluations_simple?.find(evaluation => evaluation.uuid === evaluationUuid);
  return foundEvaluation?.name || '';
};

// Carregar avaliações quando o componente for montado (necessário para modo AUTOMATIC)
onMounted(async () => {
  if (!evaluationStore.evaluations_simple) {
    await evaluationStore.getAllEvaluations();
  }
});

// Watch para gerar aplicações quando evaluatedUuids, creationType ou evaluationUuid mudar
watch([() => props.evaluatedUuids, () => props.creationType, () => props.evaluationUuid], ([newUuids]) => {
  if (!newUuids || newUuids.length === 0) {
    applicationsGroupedByEvaluated.value = [];
    emit('update:applications', []);
    emit('update:applicationsGrouped', []);
    return;
  }

  const combinedApplications: EvaluationApplicationPayload['applications'] = [];
  const uniqueRelations = new Set<string>();
  const usersWithoutEvaluation: Array<{ name: string; jobPositionTitle: string }> = [];

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

    // Determinar evaluation_uuid para este usuário avaliado
    const evaluationUuidForUser = props.creationType === 'SELECTED_EVALUATION' 
      ? props.evaluationUuid 
      : findEvaluationForUser(evaluatedUserUuid);

    // Se não encontrou avaliação no modo AUTOMATIC, registrar para mostrar warning
    if (!evaluationUuidForUser && props.creationType === 'AUTOMATIC') {
      const jobPositionTitle = evaluatedUser.jobPosition?.title || 'sem cargo';
      usersWithoutEvaluation.push({
        name: evaluatedUser.title,
        jobPositionTitle: jobPositionTitle
      });
      return; // Não adiciona nenhuma aplicação para este usuário
    }

    // Se está no modo SELECTED_EVALUATION e não tem evaluationUuid, não adiciona
    if (!evaluationUuidForUser && props.creationType === 'SELECTED_EVALUATION') {
      return;
    }

    // 1. Autoavaliação (Self)
    addUniqueApplication(
      combinedApplications,
      uniqueRelations,
      evaluatedUserUuid,
      evaluatedUserUuid,
      EvaluationType.SELF,
      evaluationUuidForUser
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
            EvaluationType.SUBORDINATE,
            evaluationUuidForUser
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
          EvaluationType.LEADER,
          evaluationUuidForUser
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
              EvaluationType.PEER,
              evaluationUuidForUser
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

  // Mostrar warning para usuários sem avaliação encontrada (modo AUTOMATIC)
  if (usersWithoutEvaluation.length > 0) {
    usersWithoutEvaluation.forEach(({ name, jobPositionTitle }) => {
      snackbarStore.show(
        `Não existe um modelo de avaliação com Descritivo de Cargo do cargo "${jobPositionTitle}" para o usuário ${name}. As aplicações não foram geradas.`,
        'warning'
      );
    });
  }

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
    <p v-if="evaluatedApplications.length > 0" class="font-weight-medium mb-2">
      Aplicações geradas para <b>{{ evaluatedApplications[0].evaluated_user?.name }}</b> do modelo <b>{{ getEvaluationName((evaluatedApplications[0] as any).evaluation_uuid) }}</b>:
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
