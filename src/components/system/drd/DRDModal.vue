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

const drd = reactive<DRDPayload>({
  uuid: props.selectedDRD?.uuid || undefined,
  rate: props.selectedDRD?.rate || 0,
  jobPosition: props.selectedDRD?.jobPosition || undefined,
  drdTopics: props.selectedDRD?.drdTopics || [{
    uuid: undefined,
    name: '',
    drdTopicItems: [{uuid: undefined, name: ''}]
  }],
  drdMetrics: props.selectedDRD?.drdMetrics || [{
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
})

watch(() => props.selectedDRD, (val) => {
  drd.uuid = val?.uuid || undefined;
  drd.rate = val?.rate || 0;
  drd.jobPosition = val?.jobPosition || undefined;
  drd.drdTopics = val?.drdTopics || [{
    uuid: undefined,
    name: '',
    drdTopicItems: [{uuid: undefined, name: ''}]
  }];
  drd.drdMetrics = val?.drdMetrics || [{
    uuid: undefined,
    name: '',
    classification: '',
    type: ''
  }];
  drd.createdByUser = val?.createdByUser || {
    name: userStore.user?.name || '',
    email: userStore.user?.email || '',
    cellphone: userStore.user?.cellphone || '',
    profile_img_url: userStore.user?.profile_img_url || ''
  };
}, { immediate: true });

const addDRDTopic = () => {
  drd.drdTopics.push({
    uuid: undefined,
    name: '',
    drdTopicItems: [{uuid: undefined, name: ''}]
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

async function onSubmit(formValues: Record<string, any>) {
  const drd: DRDPayload = formValues as DRDPayload;

  try {
    await drdStore.saveDRD(drd, props.selectedDRD?.uuid);
    snackbarStore.show('Cargo salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(drdStore.error || 'Falha ao salvar cargo.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <Form @submit="onSubmit" :initial-values="drd">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedDRD ? 'Editar DRD' : 'Novo DRD' }}
        </v-card-title>
        <v-card-text>
          <Field name="jobPosition" label="Cargo" rules="required" v-slot="{ field, errorMessage }">
            <v-select
              v-bind="field"
              label="cargo"
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

          <v-divider class="my-4" />

          <h3 class="text-subtitle-1 mb-3">Tópicos do DRD</h3>

          <div v-for="(drdTopic, index) in drd.drdTopics" :key="index" class="d-flex mb-4">
            <div class="flex-grow-1">
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

              <h3 class="text-subtitle-2 mb-3">Items do tópico do DRD</h3>

              <div v-for="(drdTopicItem, drdTopicItemIndex) in drdTopic.drdTopicItems" :key="drdTopicItemIndex" class="d-flex ml-4">
                <div class="d-flex gap-2 flex-grow-1">
                  <Field :name="`drdTopics[${drdTopicItemIndex}].name`" :label="'item '+(drdTopicItemIndex+1)" rules="required" v-slot="{ field, errorMessage }">
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
                class="mt-4 ml-4"
              >
                <v-icon left>mdi-plus</v-icon> Adicionar Item
              </v-btn>
            </div>

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

          <v-btn
            color="primary"
            variant="outlined"
            @click="addDRDTopic"
            block
            class="mt-4"
          >
            <v-icon left>mdi-plus</v-icon> Adicionar Tópico
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