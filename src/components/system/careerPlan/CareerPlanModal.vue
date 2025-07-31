<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useCareerPlanStore } from '@/stores/career-plan.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type CareerPlanPayload from '@/types/careerPlan/career-plan-payload.type';
import type CareerPlan from '@/types/careerPlan/career-plan.type';
import { useJobPositionStore } from '@/stores/job-position.store';

const careerPlanStore = useCareerPlanStore();
const snackbarStore = useSnackbarStore();
const jobPositionStore = useJobPositionStore();

const props = defineProps<{
  modelValue: boolean,
  selectedCareerPlan?: CareerPlan | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

const careerPlan = reactive<CareerPlanPayload>({
  uuid: props.selectedCareerPlan?.uuid || undefined,
  name: props.selectedCareerPlan?.name || '',
  jobPositionsInCareer: props.selectedCareerPlan?.jobPositionsInCareer || [{
    uuid: undefined,
    jobPosition: { uuid: undefined, name: '' },
    nextJobPosition: { uuid: undefined, name: '' },
    careerPlanY: undefined,
    order: 0
  }]
})

watch(() => props.selectedCareerPlan, (val) => {
  careerPlan.uuid = val?.uuid || undefined,
  careerPlan.name = val?.name || '',
  careerPlan.jobPositionsInCareer = val?.jobPositionsInCareer || [{
    uuid: undefined,
    jobPosition: { uuid: undefined, name: '' },
    nextJobPosition: { uuid: undefined, name: '' },
    careerPlanY: undefined,
    order: 0
  }]
}, { immediate: true });

const addJobPositionInCarrer = () => {
  careerPlan.jobPositionsInCareer.push({
    uuid: undefined,
    jobPosition: { uuid: undefined, name: '' },
    nextJobPosition: { uuid: undefined, name: '' },
    careerPlanY: undefined,
    order: careerPlan.jobPositionsInCareer.length
  });
};

const removeJobPositionInCareer = (index: number) => {
  if (careerPlan.jobPositionsInCareer.length > 1) {
    careerPlan.jobPositionsInCareer.splice(index, 1);
    careerPlan.jobPositionsInCareer = careerPlan.jobPositionsInCareer.map((jobPositionInCareer, index) => {
      return {...jobPositionInCareer, order: index}
    })
  } else {
    snackbarStore.show('Não é possível remover todos os cargos. Adicione um novo para poder remover este.', 'warning');
  }
};

function addCareerPlanY(index: number) {
  careerPlan.jobPositionsInCareer[index].careerPlanY = {
    uuid: '',
    name: 'Selecione um Plano de Carreira Y'
  }
};

function removeCareerPlanY(index: number) {
  careerPlan.jobPositionsInCareer[index].careerPlanY = undefined;
};

const someCareerPlanYActive = computed(() => {
  console.log(careerPlan.jobPositionsInCareer.some(jobPositionInCareer => {
    return jobPositionInCareer.careerPlanY
  }))
  return careerPlan.jobPositionsInCareer.some(jobPositionInCareer => {
    return jobPositionInCareer.careerPlanY
  })
});

async function onSubmit(formValues: Record<string, any>) {
  const careerPlan: CareerPlanPayload = formValues as CareerPlanPayload;

  try {
    await careerPlanStore.saveCareerPlan(careerPlan, props.selectedCareerPlan?.uuid);
    snackbarStore.show('Plano de carreira salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(careerPlanStore.error || 'Falha ao salvar plano de carreira.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <Form @submit="onSubmit" :initial-values="careerPlan">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedCareerPlan?.uuid ? 'Editar Plano de Carreira' : 'Novo Plano de Carreira' }}
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
          <Field name="name" label="nome" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedCareerPlan?.name"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>

          <v-divider class="my-4" />

          <h3 class="text-subtitle-1 mb-3">Cargos do Plano de Carreira</h3>

          <div v-for="(jobPositionInCareer, index) in careerPlan.jobPositionsInCareer" :key="index" style="margin-top: -10px;">
            <div class="d-flex">
              <div class="flex-grow-1">
                <Field :name="`careerPlan.jobPositionsInCareer[${index}].order`" :label="'ordem '+(index+1)" rules="required|min:0" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    v-model="jobPositionInCareer.order" :label="`Ordem ${index + 1}`"
                    type="number"
                    variant="solo-filled"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    class="mb-1 w-100 d-none"
                  />
                </Field>
  
                <div class="d-flex">
                  <div class="text-subtitle-1 font-weight-bold mr-3 mt-1">
                    {{ jobPositionInCareer.order + 1 }}
                  </div>
                  <Field :name="`careerPlan.jobPositionsInCareer[${index}].jobPosition`" :label="'cargo '+(index+1)" rules="required" v-slot="{ field, errorMessage }">
                    <v-select
                      v-bind="field"
                      :label="'Cargo '+(index+1)"
                      :items="jobPositionStore.jobPositionsOptions"
                      item-value="value"
                      item-title="title"
                      item-props="disabled"
                      :return-object="false"
                      variant="solo-filled"
                      density="compact"
                      persistent-placeholder
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                    >
                      <template v-slot:item="{ item, props: itemProps }">
                        <v-list-item v-bind="itemProps" :title="item.title" :disabled="item.raw.disabled" />
                      </template>
                    </v-select>
                  </Field>
                </div>
  
                <Field v-if="careerPlan.jobPositionsInCareer[index].careerPlanY" :name="`careerPlan.jobPositionsInCareer[${index}].careerPlanY`" label="plano de carreira Y" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    label="Plano de Carreira Y"
                    :items="jobPositionStore.jobPositionsOptions"
                    item-value="value"
                    item-title="title"
                    item-props="disabled"
                    :return-object="false"
                    variant="solo-filled"
                    density="compact"
                    persistent-placeholder
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    class="ml-12"
                  >
                    <template v-slot:item="{ item, props: itemProps }">
                      <v-list-item v-bind="itemProps" :title="item.title" :disabled="item.raw.disabled" />
                    </template>
                  </v-select>
                </Field>
  
                <Field :name="`careerPlan.jobPositionsInCareer[${index}].nextJobPosition`" :label="'próximo cargo '+(index+1)" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    label="Próximo Cargo"
                    :items="jobPositionStore.jobPositionsOptions"
                    item-value="value"
                    item-title="title"
                    item-props="disabled"
                    :return-object="false"
                    variant="solo-filled"
                    density="compact"
                    persistent-placeholder
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    class="d-none"
                  >
                    <template v-slot:item="{ item, props: itemProps }">
                      <v-list-item v-bind="itemProps" :title="item.title" :disabled="item.raw.disabled" />
                    </template>
                  </v-select>
                </Field>
              </div>
  
              <v-btn
                v-if="careerPlan.jobPositionsInCareer.length > 1" icon
                variant="text"
                color="error"
                @click="removeJobPositionInCareer(index)"
                size="small"
                class="ml-2"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>

            <template v-if="careerPlan.jobPositionsInCareer[careerPlan.jobPositionsInCareer.length - 1].order !== index">
              <hr
                class="custom-hr"
                :style="{
                  height: (34 + (careerPlan.jobPositionsInCareer[index].careerPlanY ? 42 : 0)) + 'px',
                  'margin-top': -(24 + (careerPlan.jobPositionsInCareer[index].careerPlanY ? 52 : 0)) + 'px'
                }"
              >
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
                v-if="careerPlan.jobPositionsInCareer[index].careerPlanY"
                color="error"
                size="20"
                icon
                class="custom-icon-y px-2"
                :style="{'margin-top': -(40 + (careerPlan.jobPositionsInCareer[index].careerPlanY ? 104 : 0)) + 'px'}"
                @click="removeCareerPlanY(index)"
              >
                <v-icon size="18">mdi-arrow-top-left</v-icon>
              </v-btn>
            </template>
          </div>

          <v-btn
            color="primary"
            variant="outlined"
            @click="addJobPositionInCarrer"
            block
            class="mt-4"
          >
            <v-icon left>mdi-plus</v-icon> Adicionar Cargo
          </v-btn>

        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="close">Cancelar</v-btn>
          <v-btn color="primary" type="submit">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>

<style scoped>
  /* .custom-hr {
    height: 34px;
    position: absolute;
    left: 27.24px;
    border: none;
    border-left: 2px solid #000;
  }

  .custom-icon {
    position: absolute;
    left: 16.1px;
  } */

  /* .custom-icon-y {
    position: absolute;
    left: 38.1px;
    height: 20px;
  } */

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