<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
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

const emit = defineEmits(['update:modelValue']);

const close = () => emit('update:modelValue', false);

const useJobLevelsAsBase = ref(false); 
const selectedJobPosition = ref<string | null>(null);
const selectedJobPositionObj = computed(() => {
  return jobPositionStore.job_positions?.find(jobPosition => jobPosition.uuid === selectedJobPosition.value)
});

const getInitialDRDState = (selectedDRD: DRD | null | undefined): DRDPayload => {
  const initialLevels = selectedDRD?.drdLevels && selectedDRD.drdLevels.length > 0
    ? selectedDRD.drdLevels
    : [{ uuid: undefined, name: 'Nível 1', order: 1 }];

  return {
    uuid: selectedDRD?.uuid || undefined,
    rate: selectedDRD?.rate || 5,
    job_position_uuid: selectedDRD?.jobPosition?.uuid || undefined,
    drdLevels: initialLevels,
    drdTopics: selectedDRD?.drdTopics && selectedDRD.drdTopics.length > 0 
      ? selectedDRD.drdTopics 
      : [{
        uuid: undefined,
        name: '',
        order: 1,
        drdTopicItems: [{ uuid: undefined, name: '', order: 1,
          scoresByLevel: [{
            drd_level_order: 1,
            drd_topic_item_uuid: undefined,
            drd_topic_item_order: 1,
            drd_metric_uuid: undefined,
            drd_metric_order: undefined,
            min_score: 3
          }]
        }]
      }],
    drdMetrics: selectedDRD?.drdMetrics && selectedDRD.drdMetrics.length > 0 
      ? selectedDRD.drdMetrics 
      : [{
      uuid: undefined,
      name: '',
      classification: '',
      type: '',
      order: 1,
      scoresByLevel: [{
        drd_level_order: 1,
        drd_topic_item_uuid: undefined,
        drd_topic_item_order: undefined,
        drd_metric_uuid: undefined,
        drd_metric_order: 1,
        min_score: 3
      }]
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

const minScoreOptions = computed(() => {
  switch (drd.rate) {
    case 1: return [1];
    case 2: return [1,2];
    case 3: return [1,2,3];
    case 4: return [1,2,3,4];
    case 5: return [1,2,3,4,5];
    default: return [1,2,3,4,5];
  }
});

const createMinScoresByLevel = (entity: string, order: number) => {
  return drd.drdLevels.map((level) => ({
    drd_level_uuid: undefined,
    drd_level_order: level.order,
    drd_topic_item_uuid: undefined,
    drd_topic_item_order: entity === 'topicItem' ? order : undefined,
    drd_metric_uuid: undefined,
    drd_metric_order: entity === 'metric' ? order : undefined,
    min_score: 3
  }));
};

watch(() => props.selectedDRD, (val) => {
  Object.assign(drd, getInitialDRDState(val));
}, { immediate: true });

watch(() => selectedJobPosition.value, (newJobPositionUuid) => {
  const newJobPosition = jobPositionStore.job_positions?.find(jobPosition => jobPosition.uuid === newJobPositionUuid)
  if (newJobPosition?.levelsGroup?.jobPositionsLevels) {
    if (!props.selectedDRD?.uuid || drd.drdLevels.every(l => !l.name)) {
      useJobLevelsAsBase.value = true;

      const newLevels = newJobPosition.levelsGroup.jobPositionsLevels.map((level, i) => ({
        uuid: undefined,
        name: level.name,
        order: ++i
      }));

      drd.drdLevels = newLevels;

      // Garante que o vee-validate vai atualizar o valor
      setTimeout(() => {
        newLevels.forEach((level, i) => {
          const input = document.querySelector(`#drdLevels_${i}_name`) as HTMLInputElement;
          input.value = level.name;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        })
      }, 50)

      drd.drdTopics.forEach(topic => {
        topic.drdTopicItems.forEach(item => {
          item.scoresByLevel = [];
          newLevels.forEach(level => {
            item.scoresByLevel.push({
              drd_level_uuid: undefined,
              drd_level_order: level.order,
              drd_topic_item_uuid: undefined,
              drd_topic_item_order: item.order,
              drd_metric_uuid: undefined,
              drd_metric_order: undefined,
              min_score: 3
            })
          })
        });
      });

      drd.drdMetrics.forEach(metric => {
        metric.scoresByLevel = [];
        newLevels.forEach(level => {
          metric.scoresByLevel.push({
            drd_level_uuid: undefined,
            drd_level_order: level.order,
            drd_topic_item_uuid: undefined,
            drd_topic_item_order: undefined,
            drd_metric_uuid: undefined,
            drd_metric_order: metric.order,
            min_score: 3
          });
        })
      });
    } else {
      useJobLevelsAsBase.value = false;
    }
  } else {
    useJobLevelsAsBase.value = false;
  }
}, { deep: true });

const addDRDLevel = () => {
  useJobLevelsAsBase.value = false;
  const newOrder = drd.drdLevels.length + 1;
  const newLevel = { uuid: undefined, name: `Nível ${newOrder}`, order: newOrder };
  drd.drdLevels.push(newLevel);

  setTimeout(() => {
    drd.drdLevels.forEach((level, i) => {
      const input = document.querySelector(`#drdLevels_${i}_name`) as HTMLInputElement;
      input.value = level.name;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    })
  }, 50)

  drd.drdTopics.forEach(topic => {
    topic.drdTopicItems.forEach(item => {
      item.scoresByLevel.push({
        drd_level_uuid: undefined,
        drd_level_order: newLevel.order,
        drd_topic_item_uuid: undefined,
        drd_topic_item_order: item.order,
        drd_metric_uuid: undefined,
        drd_metric_order: undefined,
        min_score: 3
      });
    });
  });

  drd.drdMetrics.forEach(metric => {
    metric.scoresByLevel.push({
      drd_level_uuid: undefined,
      drd_level_order: newLevel.order,
      drd_topic_item_uuid: undefined,
      drd_topic_item_order: undefined,
      drd_metric_uuid: undefined,
      drd_metric_order: metric.order,
      min_score: 3
    });
  });
};

const removeDRDLevel = (index: number) => {
  useJobLevelsAsBase.value = false;
  if (drd.drdLevels.length > 1) {
    const removedLevelOrder = drd.drdLevels[index].order;
    
    drd.drdLevels.splice(index, 1);

    drd.drdLevels.forEach((level, i) => {
      level.order = i + 1;
      
      const input = document.querySelector(`#drdLevels_${i}_name`) as HTMLInputElement;
      input.value = level.name;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    drd.drdTopics.forEach(topic => {
      topic.drdTopicItems.forEach(item => {
        item.scoresByLevel = item.scoresByLevel
          .filter(score => score.drd_level_order !== removedLevelOrder)
          .map((score, i) => ({ ...score, drd_level_order: i + 1 }));
      });
    });
    
    drd.drdMetrics.forEach(metric => {
      metric.scoresByLevel = metric.scoresByLevel
        .filter(score => score.drd_level_order !== removedLevelOrder)
        .map((score, i) => ({ ...score, drd_level_order: i + 1 }));
    });

  } else {
    snackbarStore.show('É necessário ter pelo menos um nível de avaliação.', 'warning');
  }
};

const addDRDTopic = () => {
  const newOrder = drd.drdTopics.length + 1;
  drd.drdTopics.push({
    uuid: undefined,
    name: '',
    order: newOrder,
    drdTopicItems: [{ uuid: undefined, name: '', order: 1,
      scoresByLevel: [{
        drd_level_order: 1,
        drd_topic_item_uuid: undefined,
        drd_topic_item_order: 1,
        drd_metric_uuid: undefined,
        drd_metric_order: undefined,
        min_score: 3
      }]
    }]
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
  const newOrder = drd.drdTopics[index].drdTopicItems.length + 1;
  drd.drdTopics[index].drdTopicItems.push({
    uuid: undefined,
    name: '',
    order: newOrder,
    scoresByLevel: createMinScoresByLevel('topicItem', newOrder)
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
  const newOrder = drd.drdMetrics.length + 1;
  drd.drdMetrics.push({
    uuid: undefined,
    name: '',
    classification: '',
    type: '',
    order: newOrder,
    scoresByLevel: createMinScoresByLevel('metric', newOrder)
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
    job_position_uuid: formValues.job_position_uuid,
    rate: formValues.rate,
  } as DRDPayload;

  const backendPayload: any = {
    job_position_uuid: payload.job_position_uuid,
    rate: payload.rate,
    levels: payload.drdLevels.map(level => ({ name: level.name, order: level.order })),
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
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="1000px">
    <Form @submit="onSubmit" :initial-values="drd">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedDRD?.uuid ? 'Editar DRD' : 'Novo DRD' }}
        </v-card-title>
        <v-card-text>
          <div class="d-flex gap-4">
            <div class="w-100">
              <Field name="job_position_uuid" label="Cargo" rules="required" v-slot="{ field, errorMessage }">
                <v-select
                  v-bind="field"
                  v-model="selectedJobPosition"
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
            </div>
            <div class="w-100">
              <div class="text-caption">Escala do DRD</div>
              <Field name="rate" label="Rate" rules="required|min_value:3" v-slot="{ field, errorMessage }">
                <v-slider
                  v-bind="field"
                  v-model="drd.rate"
                  :max="5"
                  :min="1"
                  :ticks="[1,2,3,4,5]"
                  show-ticks="always"
                  step="1"
                  tick-size="4"
                  color="primary"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                >
                  <template v-slot:tick-label="{ tick }">
                    <div class="text-caption">{{ tick.value }}</div>
                  </template>
                </v-slider>
              </Field>
            </div>
          </div>

          <v-divider class="my-4" />

          <h2 class="text-subtitle-1 mb-3">Níveis do DRD</h2>

          <div v-if="selectedJobPositionObj?.levelsGroup?.jobPositionsLevels?.length">
            <div class="text-caption mr-2 mt-2">Vi que o cargo <b>{{ selectedJobPositionObj?.title }}</b> possui um grupo de níveis vinculado, gostaria de usá-lo como base para criar os Níveis do DRD?</div>
            <v-switch 
              v-model="useJobLevelsAsBase" 
              color="primary"
              hide-details
              density="compact"
            >
              <template v-slot:label>
                <div class="text-caption" style="min-width: 20px;">
                  {{ useJobLevelsAsBase ? 'Sim' : 'Não' }}
                </div>
              </template>
            </v-switch>
          </div>

          <div v-for="(drdLevel, index) in drd.drdLevels" :key="index" class="level-group mb-4 pa-4 border rounded d-flex align-center">            
            <Field :name="`drdLevels[${index}].name`" :label="'nível '+(index+1)" rules="required" v-slot="{ field, errorMessage }">
              <v-text-field
                :id="`drdLevels_${index}_name`"
                v-bind="field"
                v-model="drdLevel.name"
                :label="`Nome do Nível ${drdLevel.order}`"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
                class="mb-1 flex-grow-1"
              />
            </Field>

            <Field :name="`drdLevels[${index}].order`" type="hidden" />

            <v-btn
              v-if="drd.drdLevels.length > 1 && !useJobLevelsAsBase"
              icon
              variant="text"
              color="error"
              @click="removeDRDLevel(index)"
              size="small"
              class="ml-2"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>

          <v-btn
            color="primary"
            variant="outlined"
            @click="addDRDLevel"
            block
            class="mt-4"
          >
            <v-icon left>mdi-plus</v-icon> Adicionar Nível
          </v-btn>
          
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

              <div class="d-flex overflow-x-auto py-2 flex-shrink-0" style="max-width: 40%; min-width: 400px; gap: 1rem;">
                <div
                  v-for="(score, levelIndex) in drdTopicItem.scoresByLevel" 
                  :key="levelIndex" 
                  class="text-center" 
                  style="min-width: 120px;"
                >
                <div class="text-caption font-weight-bold mb-n2">{{ drd.drdLevels[score.drd_level_order - 1].name }}</div>
                  <Field :name="`drdTopics[${index}].drdTopicItems[${drdTopicItemIndex}].scoresByLevel[${levelIndex}].min_score`" rules="required" v-slot="{ field }">
                    <v-slider
                      v-bind="field"
                      v-model="score.min_score"
                      :max="drd.rate"
                      :min="1"
                      :ticks="minScoreOptions"
                      show-ticks="always"
                      step="1"
                      tick-size="4"
                      color="secondary"
                      density="compact"
                      hide-details
                    >
                      <template v-slot:tick-label="{ tick }">
                        <div class="text-caption">{{ tick.value }}</div>
                      </template>
                    </v-slider>
                  </Field>
                  <Field :name="`drdTopics[${index}].drdTopicItems[${drdTopicItemIndex}].scoresByLevel[${levelIndex}].drd_level_order`" type="hidden" />
                </div>
              </div>

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
            @click="addDRDTopic()"
            block
            class="mt-4"
          >
            <v-icon left>mdi-plus</v-icon> Adicionar Novo Tópico
          </v-btn>

          <v-divider class="my-4" />

          <h2 class="text-h6 mb-3">Métricas de Avaliação</h2>
          <div v-for="(drdMetric, index) in drd.drdMetrics" :key="index" class="metric-group mb-4 pa-4 border rounded">
            <div class="d-flex justify-space-between align-center mb-2 gap-2">
              <Field :name="`drdMetrics[${index}].name`" :label="'métrica '+(index+1)" rules="required" v-slot="{ field, errorMessage }">
                <v-text-field
                  v-bind="field"
                  v-model="drdMetric.name"
                  :label="`Métrica ${index + 1}`"
                  variant="solo-filled"
                  density="compact"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  class="mb-1 flex-grow-1"
                />
              </Field>

              <div class="d-flex overflow-x-auto py-2 flex-shrink-0" style="max-width: 40%; min-width: 400px; gap: 1rem;">
                <div
                  v-for="(score, levelIndex) in drdMetric.scoresByLevel" 
                  :key="levelIndex" 
                  class="text-center" 
                  style="min-width: 120px;"
                >
                  <div class="text-caption font-weight-bold mb-n2">{{ drd.drdLevels[score.drd_level_order - 1].name }}</div>
                  <Field :name="`drdMetrics[${index}].scoresByLevel[${levelIndex}].min_score`" rules="required" v-slot="{ field, errorMessage }">
                    <v-slider
                      v-bind="field"
                      v-model="score.min_score"
                      :max="drd.rate"
                      :min="1"
                      :ticks="minScoreOptions"
                      show-ticks="always"
                      step="1"
                      tick-size="4"
                      color="secondary"
                      density="compact"
                      hide-details
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                    >
                      <template v-slot:tick-label="{ tick }">
                        <div class="text-caption">{{ tick.value }}</div>
                      </template>
                    </v-slider>
                  </Field>
                  <Field :name="`drdMetrics[${index}].scoresByLevel[${levelIndex}].drd_level_order`" type="hidden" />
                </div>
              </div>

              <v-btn
                v-if="drd.drdMetrics.length > 1"
                icon
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
