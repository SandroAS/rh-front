<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useEvaluationStore } from '@/stores/evaluation.store';
import loadItems from '@/utils/loadItems.util';
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store';
import { EvaluationApplicationStatus, EvaluationType, type EvaluationApplication } from '@/types/evaluationApplication/evaluation-application.type';
import ApplicationModal from '../ApplicationModal.vue';
import { getInitials } from '@/utils/getInitialsFromName.util';
import ApplicationModalCancel from '../ApplicationModalCancel.vue';
import ApplicationModalSend from '../ApplicationModalSend.vue';

const evaluationApplicationStore = useEvaluationApplicationStore();
const accountUserStore = useAccountUserStore();
const evaluationStore = useEvaluationStore();

const dialog = ref(false);
const dialogCancel = ref(false);
const dialogSend = ref(false);

const selectedApplication = ref<EvaluationApplication | null>(null);
const selectedApplicationCancel = ref<EvaluationApplication | null>(null);
const selectedApplicationSend = ref<EvaluationApplication | null>(null);

const currentPage = ref(evaluationApplicationStore.page);
const itemsPerPage = ref(evaluationApplicationStore.limit);
const searchTerm = ref(evaluationApplicationStore.search_term || '');
const sortBy = ref(evaluationApplicationStore.sort_column ? [{ key: evaluationApplicationStore.sort_column, order: evaluationApplicationStore.sort_order }] : []);

const openDialog = (item?: EvaluationApplication) => {
  selectedApplication.value = item || null;
  dialog.value = true;
};

const openDialogCancel = (item?: EvaluationApplication) => {
  selectedApplicationCancel.value = item || null;
  dialogCancel.value = true;
};

const openDialogSend = (item?: EvaluationApplication) => {
  selectedApplicationSend.value = item || null;
  dialogSend.value = true;
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
  await accountUserStore.getAllAccountUsersWithTeams();
  await evaluationStore.getAllEvaluations();
});

const getApplicationTypeDisplayName = (type: EvaluationType) => {
  switch (type) {
    case EvaluationType.PEER: return 'Por Pares';
    case EvaluationType.SELF: return 'Autoavaliação';
    case EvaluationType.LEADER: return 'Por Líder';
    case EvaluationType.SUBORDINATE: return 'Por Subordinado';
    default: return type;
  }
};

const getApplicationStatusDisplayName = (status: EvaluationApplicationStatus) => {
  switch (status) {
    case EvaluationApplicationStatus.CREATED: return 'ENVIO AGENDADO';
    case EvaluationApplicationStatus.SENDED: return 'ENVIADO';
    case EvaluationApplicationStatus.IN_PROGRESS: return 'EM PROGRESSO';
    case EvaluationApplicationStatus.ACCESSED: return 'ACESSADO';
    case EvaluationApplicationStatus.FINISHED: return 'FINALIZADO';
    case EvaluationApplicationStatus.EXPIRED: return 'EXPIRADO';
    case EvaluationApplicationStatus.CANCELED: return 'CANCELADO';
    default: return status;
  }
};

const getStatusColor = (status: EvaluationApplicationStatus) => {
  switch (status) {
    case EvaluationApplicationStatus.CREATED: return 'warning';
    case EvaluationApplicationStatus.SENDED: return 'info';
    case EvaluationApplicationStatus.IN_PROGRESS: 
    case EvaluationApplicationStatus.ACCESSED: return 'warning';
    case EvaluationApplicationStatus.FINISHED: return 'success';
    case EvaluationApplicationStatus.EXPIRED: return 'error';
    case EvaluationApplicationStatus.CANCELED: return 'gray';
    default: return 'gray';
  }
};
</script>

<template>
  <v-container fluid>
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
        { title: 'Modelo', value: 'evaluation_uuid', sortable: true },
        { title: 'Tipo', value: 'type', sortable: true },
        { title: 'Avaliado', value: 'evaluated_user', sortable: true },
        { title: 'Avaliador', value: 'submitting_user', sortable: true },
        { title: 'Envio', value: 'started_date', sortable: true },
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
      <template v-slot:[`item.evaluation_uuid`]="{ item }">
        {{ item?.evaluation?.name }}
      </template>

      <template v-slot:[`item.type`]="{ item }">
        <v-chip size="small" :color="item.type === EvaluationType.SELF ? 'blue-grey' : 'orange'">
          {{ getApplicationTypeDisplayName(item.type) }}
        </v-chip>
      </template>

      <template v-slot:[`item.evaluated_user`]="{ item }">
        <div class="mb-1">
          <v-chip
            pill
            size="small"
            class="mt-1"
            :class="{'pl-0': !item?.evaluated_user?.profile_img_url}"
          >
            <v-avatar v-if="item?.evaluated_user?.profile_img_url" start>
              <v-img :src="item.evaluated_user.profile_img_url"></v-img>
            </v-avatar>
            <v-avatar v-else color="primary" class="mr-1">
              <span class="text-white">{{ getInitials(item?.evaluated_user?.name || '') }}</span>
            </v-avatar>

            {{ item?.evaluated_user?.name }}
          </v-chip>
        </div>
      </template>

      <template v-slot:[`item.submitting_user`]="{ item }">
        <div class="mb-1">
          <v-chip
            pill
            size="small"
            class="mt-1"
            :class="{'pl-0': !item?.submitting_user?.profile_img_url}"
          >
            <v-avatar v-if="item?.submitting_user?.profile_img_url" start>
              <v-img :src="item.submitting_user.profile_img_url"></v-img>
            </v-avatar>
            <v-avatar v-else color="primary" class="mr-1">
              <span class="text-white">{{ getInitials(item?.submitting_user?.name || '') }}</span>
            </v-avatar>

            {{ item?.submitting_user?.name }}
          </v-chip>
        </div>
      </template>

      <template v-slot:[`item.started_date`]="{ item }">
        <div class="d-flex align-center gap-2">
          <v-icon
            size="small"
            :color="new Date(item.started_date) > new Date() ? 'warning' : 'success'"
          >
            {{ new Date(item.started_date) > new Date() ? 'mdi-clock-outline' : 'mdi-check-circle-outline' }}
          </v-icon>
          <span :class="{ 'text-warning font-weight-bold': new Date(item.started_date) > new Date() }">
            {{ new Date(item.started_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) }}
          </span>
        </div>
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <v-chip :color="getStatusColor(item.status)" size="small">
          {{ getApplicationStatusDisplayName(item.status) }}
        </v-chip>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <div class="d-flex">
          <v-btn icon @click="openDialog(item)" size="small">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="openDialogSend(item)" size="small" color="primary"
            :disabled="[
              EvaluationApplicationStatus.CANCELED,
              EvaluationApplicationStatus.FINISHED,
              EvaluationApplicationStatus.EXPIRED,
              EvaluationApplicationStatus.ACCESSED,
              EvaluationApplicationStatus.IN_PROGRESS
            ].includes(item.status)"
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
          <v-btn icon @click="openDialogCancel(item)" size="small" color="error" :disabled="item.status === EvaluationApplicationStatus.CANCELED">
            <v-icon>mdi-cancel</v-icon>
          </v-btn>
          <!-- <v-btn icon color="red" @click="evaluationApplicationStore.deleteEvaluationApplication(item.uuid)" size="small">
            <v-icon>mdi-delete</v-icon>
          </v-btn> -->
        </div>
      </template>
    </v-data-table>

    <ApplicationModal v-model="dialog" :selectedApplication="selectedApplication" />
    <ApplicationModalCancel v-model="dialogCancel" :selectedApplication="selectedApplicationCancel" />
    <ApplicationModalSend v-model="dialogSend" :selectedApplication="selectedApplicationSend" />

  </v-container>
</template>
