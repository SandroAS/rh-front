<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useForm, useField, useFieldArray } from 'vee-validate';
import { usePdiStore } from '@/stores/pdi.store';
import { usePdiCategoryStore } from '@/stores/pdi-category.store';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type Pdi from '@/types/pdi/pdi.type';
import type PdiPayload from '@/types/pdi/pdi-payload.type';
import type PdiGoalPayload from '@/types/pdi/pdi-goal-payload.type';
import { getInitials } from '@/utils/getInitialsFromName.util';
import { toDateInputValue } from '@/utils/formatDate.util';
import PdiGoalCard from './PdiGoalCard.vue';

const pdiStore = usePdiStore();
const pdiCategoryStore = usePdiCategoryStore();
const accountUserStore = useAccountUserStore();
const snackbarStore = useSnackbarStore();

const props = defineProps<{
  modelValue: boolean;
  selectedPdi?: Pdi | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved'): void;
}>();

const close = () => emit('update:modelValue', false);

function getDefaultGoal() {
  return {
    title: '',
    description: '' as string | null,
    pdi_category_uuid: null as string | null,
    start_date: '',
    end_date: '',
  };
}

const { handleSubmit, setValues, resetForm } = useForm({
  initialValues: {
    user_uuid: '',
    start_date: '',
    end_date: '',
    pdi_goals: [] as ReturnType<typeof getDefaultGoal>[],
  },
  validationSchema: {
    user_uuid: 'required',
  },
});

const { value: userUuid, errorMessage: userUuidError } = useField<string>('user_uuid', 'required');
const { value: startDate } = useField<string>('start_date');
const { value: endDate } = useField<string>('end_date');

const { fields, push, remove, replace } = useFieldArray('pdi_goals');

function addGoal() {
  push(getDefaultGoal());
}

function removeGoal(index: number) {
  remove(index);
}

watch(
  () => props.selectedPdi,
  (val) => {
    if (val?.uuid) {
      setValues({
        user_uuid: val.user?.uuid ?? '',
        start_date: toDateInputValue(val.start_date ?? val.due_date ?? ''),
        end_date: toDateInputValue(val.end_date ?? ''),
        pdi_goals:
          val.pdi_goals?.map((g) => ({
            title: g.title ?? '',
            description: g.description ?? '',
            pdi_category_uuid: g.pdi_category?.uuid ?? null,
            start_date: toDateInputValue(g.start_date ?? ''),
            end_date: toDateInputValue(g.end_date ?? ''),
          })) ?? [],
      });
    } else {
      resetForm({
        values: {
          user_uuid: '',
          start_date: '',
          end_date: '',
          pdi_goals: [],
        },
      });
    }
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      resetForm({
        values: {
          user_uuid: '',
          start_date: '',
          end_date: '',
          pdi_goals: [],
        },
      });
    } else {
      if (!props.selectedPdi?.uuid) replace([]);
      pdiCategoryStore.getAllPdiCategories().catch(() => {});
    }
  }
);

onMounted(() => {
  accountUserStore.getAllAccountUsers?.().catch(() => {});
});

const onSubmit = handleSubmit(async (formValues) => {
  const rawGoals = (formValues.pdi_goals ?? []) as ReturnType<typeof getDefaultGoal>[];
  const pdi_goals: PdiGoalPayload[] = rawGoals
    .filter((g) => (g?.title ?? '').toString().trim())
    .map((g) => ({
      title: (g.title ?? '').toString().trim(),
      description: (g.description ?? '').toString().trim() || null,
      start_date: (g.start_date ?? '').toString().trim() || null,
      end_date: (g.end_date ?? '').toString().trim() || null,
      pdi_category_uuid: (g.pdi_category_uuid ?? '').toString().trim() || null,
    }));

  const payload: PdiPayload = {
    user_uuid: (formValues.user_uuid ?? '').toString().trim() || undefined,
    start_date: (formValues.start_date ?? '').toString().trim() || undefined,
    end_date: (formValues.end_date ?? '').toString().trim() || undefined,
    pdi_goals: pdi_goals.length ? pdi_goals : undefined,
  };

  try {
    await pdiStore.savePdi(payload, props.selectedPdi?.uuid);
    snackbarStore.show(
      props.selectedPdi?.uuid ? 'PDI atualizado.' : 'PDI criado.',
      'success'
    );
    emit('saved');
    close();
  } catch {
    snackbarStore.show(pdiStore.error ?? 'Falha ao salvar PDI.', 'error');
  }
});
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="640"
    persistent
    transition="dialog-transition"
    scrollable
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ selectedPdi?.uuid ? 'Editar PDI' : 'Novo PDI' }}
      </v-card-title>
      <v-divider />
      <v-card-text class="pb-0" style="max-height: 70vh;">
        <v-autocomplete
          v-model="userUuid"
          label="Colaborador"
          :items="accountUserStore.accountUsersOptions"
          item-title="title"
          item-value="value"
          variant="solo-filled"
          hide-details="auto"
          :error="!!userUuidError"
          :error-messages="userUuidError"
          class="mb-4"
        >
          <template #selection="{ item }">
            <v-chip
              v-if="item.raw.value"
              pill
              size="small"
              class="mt-1 mr-1 pl-0"
            >
              <v-avatar v-if="item.raw.avatar" start class="ml-0">
                <v-img :src="item.raw.avatar"></v-img>
              </v-avatar>
              <v-avatar v-else size="24" color="primary" class="mr-1">
                <span class="text-white">{{ getInitials(item.raw.title) }}</span>
              </v-avatar>
              {{ item.raw.title }}
            </v-chip>
          </template>

          <template v-slot:item="{ props, item }">
            <v-list-item v-if="item.raw.avatar"
              v-bind="props"
              :prepend-avatar="item.raw.avatar"
              :title="item.raw.title"
              density="compact"
            ></v-list-item>
            <v-list-item v-else
              v-bind="props"
              :title="item.raw.title"
              density="compact"
              class="py-0"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" size="35">
                  <span class="text-white">{{ getInitials(item.raw.title) }}</span>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>

        <div class="d-flex gap-3 flex-wrap mb-4">
          <v-text-field
            v-model="startDate"
            label="Data de início"
            type="date"
            variant="solo-filled"
            density="compact"
            hide-details="auto"
            class="flex-grow-1"
            style="min-width: 160px;"
          />
          <v-text-field
            v-model="endDate"
            label="Data de fim"
            type="date"
            variant="solo-filled"
            density="compact"
            hide-details="auto"
            class="flex-grow-1"
            style="min-width: 160px;"
          />
        </div>

        <div class="text-subtitle-2 mb-2">Objetivos</div>
        <PdiGoalCard
          v-for="(field, index) in fields"
          :key="field.key"
          :index="index"
          :can-remove="fields.length > 0"
          @remove="removeGoal(index)"
        />
        <v-btn
          variant="tonal"
          color="primary"
          size="small"
          class="mt-2 mb-4"
          block
          @click="addGoal"
        >
          <v-icon start size="small">mdi-plus</v-icon>
          Adicionar objetivo
        </v-btn>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="pdiStore.loading" @click="onSubmit">
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
