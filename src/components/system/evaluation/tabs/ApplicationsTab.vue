<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useEvaluationStore } from '@/stores/evaluation.store'; // Para buscar o nome do modelo
import loadItems from '@/utils/loadItems.util';
import { useEvaluationApplicationStore } from '@/stores/evaluation.application.store';
import type EvaluationApplication from '@/types/evaluationApplication/evaluation-application.type';

// Importar um modal para criar/editar aplicações, similar ao EvaluationModal
// Você precisará criar este modal separadamente, pois a lógica de "aplicação" é diferente do "modelo".
// Por enquanto, usaremos um placeholder.
// import EvaluationApplicationModal from '@/components/system/evaluation/EvaluationApplicationModal.vue';

const evaluationApplicationStore = useEvaluationApplicationStore();
const accountUserStore = useAccountUserStore();
const evaluationStore = useEvaluationStore(); // Para buscar os modelos de avaliação

const dialog = ref(false); // Para o modal de aplicação
const selectedApplication = ref<EvaluationApplication | null>(null);

const currentPage = ref(evaluationApplicationStore.page);
const itemsPerPage = ref(evaluationApplicationStore.limit);
const searchTerm = ref(evaluationApplicationStore.search_term || '');
const sortBy = ref(evaluationApplicationStore.sort_column ? [{ key: evaluationApplicationStore.sort_column, order: evaluationApplicationStore.sort_order }] : []);

const openDialog = (item?: EvaluationApplication) => {
  selectedApplication.value = item || null;
  dialog.value = true;
};

const loadEvaluationApplications = async () => {
  await loadItems(
    { page: currentPage.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value },
    searchTerm.value,
    evaluationApplicationStore,
    'getEvaluationApplications',
    'evaluation_applications'
  );

  currentPage.value = evaluationApplicationStore.page;
  itemsPerPage.value = evaluationApplicationStore.limit;
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return;

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadEvaluationApplications();
  }, 300);
});

onMounted(async () => {
  // Carregar usuários e modelos para exibição na tabela
  await accountUserStore.getAccountUsers({ page: 1, limit: 10000 });
  await evaluationStore.getEvaluations({ page: 1, limit: 10000 });
  loadEvaluationApplications();
});

const getUserName = (uuid: string | undefined) => {
  if (!uuid) return 'N/A';
  const user = accountUserStore.account_users.find(u => u.uuid === uuid);
  return user ? user.name : 'Usuário Desconhecido';
};

const getEvaluationModelTitle = (uuid: string | undefined) => {
  if (!uuid) return 'N/A';
  const model = evaluationStore.evaluations.find(e => e.uuid === uuid);
  return model ? model.title : 'Modelo Desconhecido';
};

const getApplicationTypeDisplayName = (type: 'peer' | 'self' | 'leader') => {
  switch (type) {
    case 'peer': return 'Por Pares';
    case 'self': return 'Autoavaliação';
    case 'leader': return 'Por Líder';
    default: return type;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'info';
    case 'pending': return 'warning';
    case 'canceled': return 'error';
    default: return 'info';
  }
};
</script>

<template>
  <div>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar Aplicação de Avaliação"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        density="compact"
        hide-details
        clearable
        class="mb-4 mb-md-0 w-md-auto w-100"
        style="max-width: 300px;"
      ></v-text-field>

      <v-btn color="primary" class="w-md-auto w-100" @click="openDialog">
        <v-icon start>mdi-plus</v-icon>
        Adicionar Aplicação
      </v-btn>
    </div>

    <v-data-table
      :headers="[
        { title: 'Modelo', value: 'evaluation_model_uuid', sortable: true },
        { title: 'Tipo', value: 'type', sortable: true },
        { title: 'Solicitado por', value: 'requested_by_user_uuid', sortable: true },
        { title: 'Avaliado', value: 'evaluated_collaborator_uuid', sortable: true },
        { title: 'Avaliador', value: 'evaluator_collaborator_uuid', sortable: true },
        { title: 'Data de Solicitação', value: 'application_date', sortable: true },
        { title: 'Status', value: 'status', sortable: true },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="evaluationApplicationStore.evaluation_applications || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
      :items-length="evaluationApplicationStore.total"
      :loading="evaluationApplicationStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadEvaluationApplications"
    >
      <template v-slot:[`item.evaluation_model_uuid`]="{ item }">
        {{ getEvaluationModelTitle(item.evaluation_model_uuid) }}
      </template>

      <template v-slot:[`item.type`]="{ item }">
        <v-chip size="small" :color="item.type === 'self' ? 'blue-grey' : 'orange'">
          {{ getApplicationTypeDisplayName(item.type) }}
        </v-chip>
      </template>

      <template v-slot:[`item.requested_by_user_uuid`]="{ item }">
        {{ getUserName(item.requested_by_user_uuid) }}
      </template>

      <template v-slot:[`item.evaluated_collaborator_uuid`]="{ item }">
        {{ getUserName(item.evaluated_collaborator_uuid) }}
      </template>

      <template v-slot:[`item.evaluator_collaborator_uuid`]="{ item }">
        {{ getUserName(item.evaluator_collaborator_uuid) }}
      </template>

      <template v-slot:[`item.application_date`]="{ item }">
        {{ new Date(item.application_date).toLocaleDateString() }}
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <v-chip :color="getStatusColor(item.status)" size="small">
          {{ item.status }}
        </v-chip>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <div>
          <v-btn icon @click="openDialog(item)" size="small">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="red" @click="evaluationApplicationStore.deleteEvaluationApplication(item.uuid)" size="small">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Modal de Aplicação (Em Desenvolvimento)</v-card-title>
        <v-card-text>
          Este modal seria para criar/editar aplicações de avaliação.
          <br>
          Você selecionaria o modelo, os usuários envolvidos e o tipo de aplicação.
          <br>
          Aplicar uma avaliação copiaria o modelo para a `evaluation_application_topics` e `evaluation_application_questions`.
          <br>
          Item selecionado: {{ selectedApplication?.uuid }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
