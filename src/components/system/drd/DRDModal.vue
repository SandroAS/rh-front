<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useDRDStore } from '@/stores/drd.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type DRDPayload from '@/types/drd/drd-payload.type';
import type DRD from '@/types/drd/drd.type';
import { useJobPositionStore } from '@/stores/job-position.store';
import { useUserStore } from '@/stores/auth.store';

const drdStore = useDRDStore();
const snackbarStore = useSnackbarStore();
const jobPositionStore = useJobPositionStore();
const userStore = useUserStore();

const props = defineProps<{
  modelValue: boolean,
  selectedDRD?: DRD | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

const getInitialDRDState = (selectedDRD: DRD | null | undefined): DRDPayload => {
  return {
    uuid: selectedDRD?.uuid || undefined,
    rate: selectedDRD?.rate || 0,
    jobPosition: selectedDRD?.jobPosition || undefined,
    drdTopics: selectedDRD?.drdTopics && selectedDRD.drdTopics.length > 0 ? selectedDRD.drdTopics : [{
      uuid: undefined,
      name: '',
      drdTopicItems: [{ uuid: undefined, name: '' }]
    }],
    drdMetrics: selectedDRD?.drdMetrics && selectedDRD.drdMetrics.length > 0 ? selectedDRD.drdMetrics : [{
      uuid: undefined,
      name: '',
      classification: '',
      type: ''
    }],
    createdByUser: {
      name: userStore.user?.name || '',
      email: userStore.user?.email || '',
      cellphone: userStore.user?.cellphone || '',
      profile_img_url: userStore.user?.profile_img_url || ''
    }
  } as DRDPayload;
}

const drd = reactive<DRDPayload>(getInitialDRDState(props.selectedDRD));

watch(() => props.selectedDRD, (val) => {
  Object.assign(drd, getInitialDRDState(val));
}, { immediate: true });

const addDRDTopic = () => {
  drd.drdTopics.push({
    uuid: undefined,
    name: '',
    drdTopicItems: [{ uuid: undefined, name: '' }]
  });
};

const removeDRDTopic = (index: number) => {
  if (drd.drdTopics.length > 1) {
    drd.drdTopics.splice(index, 1);
  } else {
    snackbarStore.show('Não é possível remover todos os tópicos de drd. Adicione um novo para poder remover este.', 'warning');
  }
};

const addDRDTopicItem = (index: number) => {
  drd.drdTopics[index].drdTopicItems.push({
    uuid: undefined,
    name: ''
  });
};

const removeDRDTopicItem = (index: number, indexTopicItem: number) => {
  if (drd.drdTopics[index].drdTopicItems.length > 1) {
    drd.drdTopics[index].drdTopicItems.splice(indexTopicItem, 1);
  } else {
    snackbarStore.show('Não é possível remover todos os items do tópico de drd. Adicione um novo para poder remover este.', 'warning');
  }
};

const addDRDMetric = () => {
  drd.drdMetrics.push({
    uuid: undefined,
    name: '',
    classification: '',
    type: ''
  });
};

const removeDRDMetric = (index: number) => {
  if (drd.drdMetrics.length > 1) {
    drd.drdMetrics.splice(index, 1);
  } else {
    snackbarStore.show('É necessário ter pelo menos uma métrica de avaliação.', 'warning');
  }
};

async function onSubmit(formValues: Record<string, any>) {
  const payload: DRDPayload = {
    ...drd,
    jobPosition: formValues.jobPosition, 
    rate: formValues.rate,
  } as DRDPayload; 
  
  const backendPayload: any = {
      job_position_uuid: payload.jobPosition?.uuid,
      rate: payload.rate,
      levels: [],
      metrics: payload.drdMetrics,
      topics: payload.drdTopics,
  };


  try {
    await drdStore.saveDRD(backendPayload, props.selectedDRD?.uuid); 
    snackbarStore.show(!!props.selectedDRD?.uuid ? 'DRD atualizado com sucesso!' : 'DRD salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(drdStore.error || 'Falha ao salvar DRD.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="800px">
    <Form @submit="onSubmit" :initial-values="drd">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedDRD?.uuid ? 'Editar DRD' : 'Novo DRD' }}
        </v-card-title>
        <v-card-text>
          <div class="d-flex gap-4 mb-4">
            <Field name="jobPosition" label="Cargo" rules="required" v-slot="{ field, errorMessage }">
              <v-select
                v-bind="field"
                label="Cargo"
                :items="jobPositionStore.jobPositionsOptions"
                item-value="value"
                item-title="title"
                :return-object="false"
                variant="solo-filled"
                density="compact"
                persistent-placeholder
                :error="!!errorMessage"
                :error-messages="errorMessage"
                class="flex-grow-1"
              >
                <template v-slot:item="{ item, props: itemProps }">
                  <v-list-item v-bind="itemProps" :title="item.title" :disabled="item.raw.disabled" />
                </template>
              </v-select>
            </Field>

            <Field name="rate" label="Rate" rules="required|min_value:1" v-slot="{ field, errorMessage }">
              <v-text-field
                v-bind="field"
                label="Rate (Peso)"
                type="number"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
                style="max-width: 150px;"
              />
            </Field>
          </div>

          <v-divider class="my-4" />

          <h2 class="text-h6 mb-3">Tópicos e Itens</h2>
          <div v-for="(drdTopic, index) in drd.drdTopics" :key="index" class="topic-group mb-4 pa-4 border rounded">
            <div class="d-flex justify-space-between align-center mb-2">
              <Field :name="`drdTopics[${index}].name`" :label="'tópico '+(index+1)" rules="required" v-slot="{ field, errorMessage }">
                <v-text-field
                  v-bind="field"
                  v-model="drdTopic.name" :label="`Tópico ${index + 1}`"
                  variant="solo-filled"
                  density="compact"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  class="mb-1 w-100"
                />
              </Field>
              <v-btn
                v-if="drd.drdTopics.length > 1" icon
                variant="text"
                color="error"
                @click="removeDRDTopic(index)"
                size="small"
                class="ml-2"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>

            <h3 class="text-subtitle-2 mb-3 ml-4">Itens do Tópico</h3>

            <div v-for="(drdTopicItem, drdTopicItemIndex) in drdTopic.drdTopicItems" :key="drdTopicItemIndex" class="d-flex ml-4 align-center gap-2">
              <Field :name="`drdTopics[${index}].drdTopicItems[${drdTopicItemIndex}].name`" :label="'item '+(drdTopicItemIndex+1)" rules="required" v-slot="{ field, errorMessage }">
                <v-text-field
                  v-bind="field"
                  v-model="drdTopicItem.name" :label="`Item ${drdTopicItemIndex + 1}`"
                  variant="solo-filled"
                  density="compact"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  class="mb-1 w-100"
                />
              </Field>
              
              <v-btn
                v-if="drdTopic.drdTopicItems.length > 1" icon
                variant="text"
                color="error"
                @click="removeDRDTopicItem(index, drdTopicItemIndex)"
                size="small"
                class="ml-2"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>

            <v-btn
              color="primary"
              variant="outlined"
              @click="addDRDTopicItem(index)"
              size="small"
              class="mt-2 ml-4"
            >
              <v-icon left>mdi-plus</v-icon> Adicionar Item
            </v-btn>
          </div>

          <v-btn
            color="primary"
            variant="outlined"
            @click="addDRDTopic"
            block
            class="mt-4"
          >
            <v-icon left>mdi-plus</v-icon> Adicionar Novo Tópico
          </v-btn>

          <v-divider class="my-4" />

          <h2 class="text-h6 mb-3">Métricas de Avaliação</h2>
          <div v-for="(drdMetric, index) in drd.drdMetrics" :key="index" class="metric-group mb-4 pa-4 border rounded">
            <div class="d-flex justify-space-between align-center mb-2">
              <Field :name="`drdMetrics[${index}].name`" :label="'métrica '+(index+1)" rules="required" v-slot="{ field, errorMessage }">
                <v-text-field
                  v-bind="field"
                  v-model="drdMetric.name" :label="`Métrica ${index + 1}`"
                  variant="solo-filled"
                  density="compact"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  class="mb-1 flex-grow-1"
                />
              </Field>
              <v-btn
                v-if="drd.drdMetrics.length > 1" icon
                variant="text"
                color="error"
                @click="removeDRDMetric(index)"
                size="small"
                class="ml-2"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>

            <div class="d-flex gap-4">
              <Field :name="`drdMetrics[${index}].classification`" label="Classificação" v-slot="{ field }">
                <v-text-field
                  v-bind="field"
                  v-model="drdMetric.classification" label="Classificação (Ex: Comportamental)"
                  variant="solo-filled"
                  density="compact"
                  class="flex-grow-1"
                />
              </Field>

              <Field :name="`drdMetrics[${index}].type`" label="Tipo" v-slot="{ field }">
                <v-text-field
                  v-bind="field"
                  v-model="drdMetric.type" label="Tipo (Ex: Soft Skill)"
                  variant="solo-filled"
                  density="compact"
                  class="flex-grow-1"
                />
              </Field>
            </div>

            </div>

          <v-btn
            color="primary"
            variant="outlined"
            @click="addDRDMetric"
            block
            class="mt-4"
          >
            <v-icon left>mdi-plus</v-icon> Adicionar Métrica
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
