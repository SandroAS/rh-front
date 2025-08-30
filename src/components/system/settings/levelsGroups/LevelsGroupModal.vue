<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type JobPositionsLevelsGroupPayload from '@/types/jobPositionsLevelsGroup/job-positions-levels-group-payload.type';
import type JobPositionsLevelsGroup from '@/types/jobPositionsLevelsGroup/job-positions-levels-group.type';
import { useJobPositionsLevelsGroupStore } from '@/stores/job-positions-levels-group.store';
import type JobPositionsLevel from '@/types/jobPositionsLevel/job-positions-level.type';

const jobPositionsLevelsGroupStore = useJobPositionsLevelsGroupStore();
const snackbarStore = useSnackbarStore();

const props = defineProps<{
  modelValue: boolean,
  selectedLevelsGroup?: JobPositionsLevelsGroup | null
}>();

const emit = defineEmits(['update:modelValue']);

const close = () => emit('update:modelValue', false);

const jobPositionsLevelsGroup = reactive<JobPositionsLevelsGroupPayload & { jobPositionsLevels: JobPositionsLevel[] }>({
  uuid: undefined,
  name: '',
  jobPositionsLevels: [{ name: '', salary: undefined }]
});

watch(() => props.selectedLevelsGroup, (val) => {
  jobPositionsLevelsGroup.uuid = val?.uuid || undefined;
  jobPositionsLevelsGroup.name = val?.name || '';
  jobPositionsLevelsGroup.jobPositionsLevels = (val?.jobPositionsLevels && val.jobPositionsLevels.length > 0)
    ? val.jobPositionsLevels.map(level => ({ name: level.name, salary: level.salary || undefined }))
    : [{ name: '', salary: undefined }];
}, { immediate: true, deep: true });

const addLevel = () => {
  jobPositionsLevelsGroup.jobPositionsLevels.push({ name: '', salary: undefined });
};

const removeLevel = (index: number) => {
  if (jobPositionsLevelsGroup.jobPositionsLevels.length > 1) {
    jobPositionsLevelsGroup.jobPositionsLevels.splice(index, 1);
  } else {
    snackbarStore.show('Não é possível remover todos os níveis. Adicione um novo para poder remover este.', 'warning');
  }
};

async function onSubmit(formValues: Record<string, any>) {
  const filteredLevels = jobPositionsLevelsGroup.jobPositionsLevels.filter(jobPositionsLevel =>
    jobPositionsLevel.name.trim() !== '' || (jobPositionsLevel.salary !== null && jobPositionsLevel.salary !== 0)
  );

  if (filteredLevels.length === 0) {
    snackbarStore.show('Adicione pelo menos um nível de cargo e remuneração válidos.', 'error');
    return;
  }

  const payload: JobPositionsLevelsGroupPayload = {
    uuid: jobPositionsLevelsGroup.uuid,
    name: formValues.name,
    jobPositionsLevels: filteredLevels
  };

  try {
    await jobPositionsLevelsGroupStore.saveLevelsGroup(payload, payload.uuid);
    snackbarStore.show('Níveis do Cargo salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(jobPositionsLevelsGroupStore.error || 'Falha ao salvar níveis do cargo.', 'error');
  }
};

function formatAmountDisplay(index: number) {
  if(props?.selectedLevelsGroup?.jobPositionsLevels && props?.selectedLevelsGroup?.jobPositionsLevels.length) {
    const valueAsNumber = parseFloat(String(props.selectedLevelsGroup?.jobPositionsLevels[index] || '0.00').replace(',', '.'));
    
    if (isNaN(valueAsNumber) || valueAsNumber === null) {
      return '0,00';
    }
  
    return valueAsNumber.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    });
  }

  return '0,00';
};

function handleAmountKeydown(event: KeyboardEvent, currentValue: string | number | null, onChange: (value: any) => void, index: number) {
  const key = event.key;
  
  let currentInCentsString = '';
  if (currentValue !== null && currentValue !== undefined) {
    currentInCentsString = String(currentValue).replace(/\D/g, '');
  }

  if (!/^\d$/.test(key) && key !== 'Backspace') {
    event.preventDefault();
    return;
  }

  let newPriceString = currentInCentsString;

  if (key === 'Backspace') {
    newPriceString = newPriceString.slice(0, -1);
    if (newPriceString.length === 0) {
      newPriceString = '0';
    }
  } else {
    newPriceString += key;
  }

  newPriceString = newPriceString.replace(/^0+(?=\d)/, '');

  const newPriceValueInCents = newPriceString === '' ? null : parseFloat(newPriceString);
  
  const valueForVeeValidate = newPriceValueInCents !== null 
    ? (newPriceValueInCents / 100).toFixed(2) 
    : null;

  onChange(valueForVeeValidate);
  jobPositionsLevelsGroup!.jobPositionsLevels[index].salary = Number(valueForVeeValidate);
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="600px">
    <Form @submit="onSubmit" :initial-values="jobPositionsLevelsGroup">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedLevelsGroup?.uuid ? 'Editar Níveis do Cargo' : 'Novo Níveis do Cargo' }}
        </v-card-title>
        <v-card-text>
          <Field name="name" label="nome" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome do Grupo de Níveis"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedLevelsGroup?.name"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>

          <v-divider class="my-4" />

          <h3 class="text-subtitle-1 mb-3">Níveis de Cargo e Remuneração</h3>

          <div v-for="(jobPositionsLevel, index) in jobPositionsLevelsGroup.jobPositionsLevels" :key="index" class="d-flex mb-4">
            <div class="d-flex gap-2 flex-grow-1">
              <Field :name="`jobPositionsLevels[${index}].name`" :label="'nível '+(index+1)" rules="required" v-slot="{ field, errorMessage }">
                <v-text-field
                  v-bind="field"
                  v-model="jobPositionsLevel.name"
                  :label="`Nível ${index + 1}`"
                  variant="solo-filled"
                  density="compact"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  class="mb-1 w-100"
                />
              </Field>
              <Field :name="`jobPositionsLevels[${index}].salary`" :label="'remuneração do nível '+(index+1)" rules="required|min_value:0" v-slot="{ field, errorMessage, value }">
                <v-text-field
                  v-bind="field"
                  v-model="jobPositionsLevelsGroup.jobPositionsLevels[index].salary"
                  :label="`Remuneração nível ${index + 1}`"
                  variant="solo-filled"
                  density="compact"
                  type="text"
                  prefix="R$"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  class="mb-1 w-100 text-right"
                  @keydown.prevent="handleAmountKeydown($event, value, field.onChange, index)"
                />
              </Field>
            </div>
            <v-btn
              v-if="jobPositionsLevelsGroup.jobPositionsLevels.length > 1" icon
              variant="text"
              color="error"
              @click="removeLevel(index)"
              size="small"
              class="ml-2"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>

          <v-btn
            color="primary"
            variant="outlined"
            @click="addLevel"
            block
            class="mt-4"
          >
            <v-icon left>mdi-plus</v-icon> Adicionar Nível
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
.v-text-field.text-right :deep(.v-field__input) {
  text-align: right;
}
</style>
