<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useForm, useField } from 'vee-validate';
import { useCareerPlanStore } from '@/stores/career-plan.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type CareerPlanPayload from '@/types/careerPlan/career-plan-payload.type';
import type CareerPlan from '@/types/careerPlan/career-plan.type';
import type CareerPlanJobPositions from '@/types/careerPlan/career-plan-job-position.type';
import type JobPositionSimple from '@/types/jobPosition/job-position-simple.type';
import { useJobPositionStore } from '@/stores/job-position.store';

const careerPlanStore = useCareerPlanStore();
const snackbarStore = useSnackbarStore();
const jobPositionStore = useJobPositionStore();

const props = defineProps<{
  modelValue: boolean;
  selectedCareerPlan?: CareerPlan | null;
}>();

const emit = defineEmits(['update:modelValue']);

const close = () => emit('update:modelValue', false);

function toFormItem(jpic: CareerPlanJobPositions): CareerPlanJobPositions {
  return {
    ...jpic,
    jobPosition: { ...jpic.jobPosition },
  };
}

function defaultFormItem(order: number): CareerPlanJobPositions {
  return {
    uuid: '',
    job_position_uuid: '',
    order,
    jobPosition: { uuid: '', title: '' },
  };
}

const { handleSubmit, setValues, resetForm } = useForm({
  initialValues: {
    name: props.selectedCareerPlan?.name ?? '',
    uuid: props.selectedCareerPlan?.uuid,
  },
  validationSchema: {
    name: 'required',
  },
});

const { value: name, errorMessage: nameError } = useField<string>('name', 'required');

const careerPlanJobPositions = ref<CareerPlanJobPositions[]>(
  (props.selectedCareerPlan?.careerPlanJobPositions?.length ?? 0) > 0
    ? props.selectedCareerPlan!.careerPlanJobPositions.map(toFormItem)
    : [defaultFormItem(0)]
);

const careerPlanYOptions = computed(() => {
  const list = careerPlanStore.careerPlans ?? [];
  const currentUuid = props.selectedCareerPlan?.uuid;
  return list
    .filter((p) => p.uuid !== currentUuid)
    .map((p) => ({ value: p.uuid, title: p.name }));
});

watch(
  () => props.selectedCareerPlan,
  (val) => {
    setValues({
      name: val?.name ?? '',
      uuid: val?.uuid,
    });
    careerPlanJobPositions.value =
      (val?.careerPlanJobPositions?.length ?? 0) > 0
        ? val!.careerPlanJobPositions.map(toFormItem)
        : [defaultFormItem(0)];
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      resetForm({
        values: {
          name: '',
          uuid: undefined,
        },
      });
      careerPlanJobPositions.value = [defaultFormItem(0)];
    }
  }
);

function addJobPositionInCareer() {
  careerPlanJobPositions.value.push(
    defaultFormItem(careerPlanJobPositions.value.length)
  );
}

function removeJobPositionInCareer(index: number) {
  if (careerPlanJobPositions.value.length <= 1) {
    snackbarStore.show(
      'Não é possível remover todos os cargos. Adicione um novo para poder remover este.',
      'warning'
    );
    return;
  }
  careerPlanJobPositions.value.splice(index, 1);
  careerPlanJobPositions.value = careerPlanJobPositions.value.map((item, i) => ({
    ...item,
    order: i,
  }));
}

function addCareerPlanY(index: number) {
  careerPlanJobPositions.value[index].career_plan_y_uuid = '';
}

function removeCareerPlanY(index: number) {
  delete careerPlanJobPositions.value[index].career_plan_y_uuid;
}

const someCareerPlanYActive = computed(() =>
  careerPlanJobPositions.value.some(
    (item) => item.career_plan_y_uuid !== undefined
  )
);

function onJobPositionChange(index: number, value: string) {
  const item = careerPlanJobPositions.value[index];
  item.job_position_uuid = value;
  const opt = jobPositionStore.jobPositionsOptions.find((o) => o.value === value);
  item.jobPosition = (opt
    ? { uuid: opt.value, title: opt.title }
    : { uuid: value, title: '' }) as JobPositionSimple;
}

function onCareerPlanYChange(index: number, value: string) {
  careerPlanJobPositions.value[index].career_plan_y_uuid = value || undefined;
}

const onSubmit = handleSubmit(async (formValues) => {
  const payload: CareerPlanPayload = {
    uuid: formValues.uuid as string | undefined,
    name: formValues.name as string,
    careerPlanJobPositions: careerPlanJobPositions.value.map(
      (item): CareerPlanJobPositions => {
        const base = {
          uuid: item.uuid,
          job_position_uuid: item.job_position_uuid,
          order: item.order,
          jobPosition: { ...item.jobPosition },
        };
        if (item.career_plan_y_uuid) {
          return { ...base, career_plan_y_uuid: item.career_plan_y_uuid };
        }
        return base;
      }
    ),
  };
  try {
    await careerPlanStore.saveCareerPlan(payload, props.selectedCareerPlan?.uuid);
    snackbarStore.show('Plano de carreira salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro ao salvar:', err);
    snackbarStore.show(
      careerPlanStore.error ?? 'Falha ao salvar plano de carreira.',
      'error'
    );
  }
});
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ selectedCareerPlan?.uuid ? 'Editar Plano de Carreira' : 'Novo Plano de Carreira' }}
      </v-card-title>
      <div class="d-flex ml-6">
        <v-btn color="primary" size="20" icon readonly class="mr-2">
          <v-icon size="18">mdi-arrow-bottom-right</v-icon>
        </v-btn>
        <div>
          Adicionar plano de carreira Y
        </div>
      </div>
      <v-card-text>
        <v-text-field
          v-model="name"
          label="Nome"
          variant="solo-filled"
          density="compact"
          :persistent-placeholder="!!selectedCareerPlan?.name"
          :error="!!nameError"
          :error-messages="nameError"
          class="mb-3"
        />

        <v-divider class="my-4" />

        <h3 class="text-subtitle-1 mb-3">Cargos do Plano de Carreira</h3>

        <div
          v-for="(jobPositionInCareer, index) in careerPlanJobPositions"
          :key="index"
          style="margin-top: -10px;"
        >
          <div class="d-flex">
            <div class="flex-grow-1">
              <div class="d-flex">
                <div class="text-subtitle-1 font-weight-bold mr-3 mt-1">
                  {{ index + 1 }}
                </div>
                <v-select
                  :model-value="jobPositionInCareer.job_position_uuid"
                  @update:model-value="onJobPositionChange(index, $event)"
                  :label="'Cargo ' + (index + 1)"
                  :items="jobPositionStore.jobPositionsOptions"
                  item-value="value"
                  item-title="title"
                  item-props="disabled"
                  variant="solo-filled"
                  density="compact"
                  persistent-placeholder
                  class="flex-grow-1"
                >
                  <template v-slot:item="{ item, props: itemProps }">
                    <v-list-item
                      v-bind="itemProps"
                      :title="item.title"
                      :disabled="item.raw?.disabled"
                    />
                  </template>
                </v-select>
              </div>

              <v-select
                v-if="typeof jobPositionInCareer.career_plan_y_uuid === 'string'"
                :model-value="jobPositionInCareer.career_plan_y_uuid"
                @update:model-value="onCareerPlanYChange(index, $event)"
                label="Plano de Carreira Y"
                :items="careerPlanYOptions"
                item-value="value"
                item-title="title"
                variant="solo-filled"
                density="compact"
                persistent-placeholder
                clearable
                class="ml-12 mt-2"
              >
                <template v-slot:item="{ item, props: itemProps }">
                  <v-list-item v-bind="itemProps" :title="item.title" />
                </template>
              </v-select>
            </div>

            <v-btn
              v-if="careerPlanJobPositions.length > 1"
              icon
              variant="text"
              color="error"
              @click="removeJobPositionInCareer(index)"
              size="small"
              class="ml-2"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>

          <template v-if="index < careerPlanJobPositions.length - 1">
            <hr
              class="custom-hr"
              :style="{
                height:
                  (34 +
                    (typeof jobPositionInCareer.career_plan_y_uuid === 'string'
                      ? 42
                      : 0)) + 'px',
                'margin-top':
                  -(
                    24 +
                    (typeof jobPositionInCareer.career_plan_y_uuid === 'string'
                      ? 52
                      : 0)
                  ) + 'px',
              }"
            />
            <v-icon class="custom-icon">mdi-chevron-down</v-icon>
            <v-btn
              v-if="!someCareerPlanYActive"
              color="primary"
              size="20"
              icon
              class="custom-icon-y px-2"
              @click="addCareerPlanY(index)"
            >
              <v-icon size="18">mdi-arrow-bottom-right</v-icon>
            </v-btn>
            <v-btn
              v-if="typeof jobPositionInCareer.career_plan_y_uuid === 'string'"
              color="error"
              size="20"
              icon
              class="custom-icon-y px-2"
              :style="{
                'margin-top':
                  -(
                    40 +
                    (typeof jobPositionInCareer.career_plan_y_uuid === 'string'
                      ? 104
                      : 0)
                  ) + 'px',
              }"
              @click="removeCareerPlanY(index)"
            >
              <v-icon size="18">mdi-arrow-top-left</v-icon>
            </v-btn>
          </template>
        </div>

        <v-btn
          color="primary"
          variant="outlined"
          @click="addJobPositionInCareer"
          block
          class="mt-4"
        >
          <v-icon left>mdi-plus</v-icon> Adicionar Cargo
        </v-btn>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="onSubmit">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.custom-hr {
  height: 34px;
  border: none;
  border-left: 2px solid #000;
  margin-top: -24px;
  margin-left: 2.3px;
}

.custom-icon {
  margin-top: -29px;
  margin-left: -8.5px;
}

.custom-icon-y {
  margin-top: -40px;
}
</style>
