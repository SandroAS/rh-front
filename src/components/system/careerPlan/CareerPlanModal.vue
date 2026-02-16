<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
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

const careerPlan = reactive<{
  uuid?: string;
  name: string;
  careerPlanJobPositions: CareerPlanJobPositions[];
}>({
  uuid: props.selectedCareerPlan?.uuid,
  name: props.selectedCareerPlan?.name ?? '',
  careerPlanJobPositions:
    (props.selectedCareerPlan?.careerPlanJobPositions?.length ?? 0) > 0
      ? props.selectedCareerPlan!.careerPlanJobPositions.map(toFormItem)
      : [defaultFormItem(0)],
});

watch(
  () => props.selectedCareerPlan,
  (val) => {
    careerPlan.uuid = val?.uuid;
    careerPlan.name = val?.name ?? '';
    careerPlan.careerPlanJobPositions =
      (val?.careerPlanJobPositions?.length ?? 0) > 0
        ? val!.careerPlanJobPositions.map(toFormItem)
        : [defaultFormItem(0)];
  },
  { immediate: true }
);

const careerPlanYOptions = computed(() => {
  const list = careerPlanStore.careerPlans ?? [];
  const currentUuid = props.selectedCareerPlan?.uuid;
  return list
    .filter((p) => p.uuid !== currentUuid)
    .map((p) => ({ value: p.uuid, title: p.name }));
});

function addJobPositionInCareer() {
  careerPlan.careerPlanJobPositions.push(
    defaultFormItem(careerPlan.careerPlanJobPositions.length)
  );
}

function removeJobPositionInCareer(index: number) {
  if (careerPlan.careerPlanJobPositions.length <= 1) {
    snackbarStore.show(
      'Não é possível remover todos os cargos. Adicione um novo para poder remover este.',
      'warning'
    );
    return;
  }
  careerPlan.careerPlanJobPositions.splice(index, 1);
  careerPlan.careerPlanJobPositions = careerPlan.careerPlanJobPositions.map(
    (item, i) => ({ ...item, order: i })
  );
}

/** Adiciona bifurcação “carreira em Y”: usuário pode seguir este plano ou migrar para outro. */
function addCareerPlanY(index: number) {
  careerPlan.careerPlanJobPositions[index].career_plan_y_uuid = '';
}

function removeCareerPlanY(index: number) {
  delete careerPlan.careerPlanJobPositions[index].career_plan_y_uuid;
}

const someCareerPlanYActive = computed(() =>
  careerPlan.careerPlanJobPositions.some(
    (item) => item.career_plan_y_uuid !== undefined
  )
);

function onJobPositionChange(index: number, value: string) {
  const item = careerPlan.careerPlanJobPositions[index];
  item.job_position_uuid = value;
  const opt = jobPositionStore.jobPositionsOptions.find((o) => o.value === value);
  item.jobPosition = (opt
    ? { uuid: opt.value, title: opt.title }
    : { uuid: value, title: '' }) as JobPositionSimple;
}

function onCareerPlanYChange(index: number, value: string) {
  careerPlan.careerPlanJobPositions[index].career_plan_y_uuid =
    value || undefined;
}

async function onSubmit(formValues: Record<string, unknown>) {
  const name = (formValues.name as string) ?? careerPlan.name;
  const payload: CareerPlanPayload = {
    uuid: careerPlan.uuid,
    name,
    careerPlanJobPositions: careerPlan.careerPlanJobPositions.map(
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
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="500px"
  >
    <Form @submit="onSubmit" :initial-values="careerPlan">
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
          <Field name="name" label="Nome" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!selectedCareerPlan?.name"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>

          <v-divider class="my-4" />

          <h3 class="text-subtitle-1 mb-3">Cargos do Plano de Carreira</h3>

          <div
            v-for="(jobPositionInCareer, index) in careerPlan.careerPlanJobPositions"
            :key="index"
            style="margin-top: -10px;"
          >
            <div class="d-flex">
              <div class="flex-grow-1">
                <Field
                  :name="`careerPlanJobPositions[${index}].order`"
                  label="ordem"
                  rules="required|min:0"
                  v-slot="{ field }"
                >
                  <v-text-field
                    v-bind="field"
                    v-model="jobPositionInCareer.order"
                    type="number"
                    class="d-none"
                    style="display: none;"
                  />
                </Field>

                <div class="d-flex">
                  <div class="text-subtitle-1 font-weight-bold mr-3 mt-1">
                    {{ jobPositionInCareer.order + 1 }}
                  </div>
                  <Field
                    :name="`careerPlanJobPositions[${index}].job_position_uuid`"
                    :label="'cargo ' + (index + 1)"
                    rules="required"
                    v-slot="{ field, errorMessage }"
                  >
                    <v-select
                      v-bind="field"
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
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                    >
                      <template v-slot:item="{ item, props: itemProps }">
                        <v-list-item
                          v-bind="itemProps"
                          :title="item.title"
                          :disabled="item.raw?.disabled"
                        />
                      </template>
                    </v-select>
                  </Field>
                </div>

                <Field
                  v-if="jobPositionInCareer.career_plan_y_uuid !== undefined"
                  :name="`careerPlanJobPositions[${index}].career_plan_y_uuid`"
                  label="Plano de Carreira Y (bifurcação)"
                  v-slot="{ field, errorMessage }"
                >
                  <v-select
                    v-bind="field"
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
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    class="ml-12"
                  >
                    <template v-slot:item="{ item, props: itemProps }">
                      <v-list-item v-bind="itemProps" :title="item.title" />
                    </template>
                  </v-select>
                </Field>
              </div>

              <v-btn
                v-if="careerPlan.careerPlanJobPositions.length > 1"
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

            <template v-if="index < careerPlan.careerPlanJobPositions.length - 1">
              <hr
                class="custom-hr"
                :style="{
                  height:
                    (34 +
                      (jobPositionInCareer.career_plan_y_uuid !== undefined
                        ? 42
                        : 0)) + 'px',
                  'margin-top':
                    -(
                      24 +
                      (jobPositionInCareer.career_plan_y_uuid !== undefined
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
                v-if="jobPositionInCareer.career_plan_y_uuid !== undefined"
                color="error"
                size="20"
                icon
                class="custom-icon-y px-2"
                :style="{
                  'margin-top':
                    -(
                      40 +
                      (jobPositionInCareer.career_plan_y_uuid !== undefined
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
          <v-btn color="primary" type="submit">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </Form>
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
