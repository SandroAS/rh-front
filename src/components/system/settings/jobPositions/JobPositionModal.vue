<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useJobPositionStore } from '@/stores/job-position.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type JobPositionPayload from '@/types/jobPosition/job-position-payload.type';
import type JobPosition from '@/types/jobPosition/job-position.type';
import { useJobPositionsLevelsGroupStore } from '@/stores/job-positions-levels-group.store';

const jobPositionStore = useJobPositionStore();
const snackbarStore = useSnackbarStore();
const levelsGroupStore = useJobPositionsLevelsGroupStore()

const props = defineProps<{
  modelValue: boolean,
  selectedJobPosition?: JobPosition | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

let jobPosition = reactive<JobPositionPayload>({
  uuid: props.selectedJobPosition?.uuid || undefined,
  title: props.selectedJobPosition?.title || '',
  description: props.selectedJobPosition?.description || '',
  cbo_code: props.selectedJobPosition?.cbo_code || '',
  base_salary: props.selectedJobPosition?.base_salary || '0.00',
  levelsGroup: props.selectedJobPosition?.levelsGroup || undefined
})

watch(() => props.selectedJobPosition, (val) => {
  jobPosition.uuid = val?.uuid || undefined
  jobPosition.title = val?.title || ''
  jobPosition.description = val?.description || ''
  jobPosition.cbo_code = val?.cbo_code || ''
  jobPosition.base_salary = val?.base_salary || '0.00'
  jobPosition.levelsGroup = val?.levelsGroup || undefined
}, { immediate: true })

async function onSubmit(formValues: Record<string, any>) {
  const jobPosition: JobPositionPayload = formValues as JobPositionPayload;

  try {
    await jobPositionStore.saveJobPosition(jobPosition, props.selectedJobPosition?.uuid);
    snackbarStore.show('Cargo salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(jobPositionStore.error || 'Falha ao salvar cargo.', 'error');
  }
};

const displayFormattedValue = computed((val) => {
  const valueAsNumber = parseFloat(String(props.selectedJobPosition?.base_salary || '0.00').replace(',', '.'));
  
  if (isNaN(valueAsNumber) || valueAsNumber === null) {
    return '0,00';
  }

  return valueAsNumber.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
});

function handleBaseSalaryKeydown(event: KeyboardEvent, currentValue: string | number | null, onChange: (value: any) => void) {
  const key = event.key;
  
  let currentPriceInCentsString = '';
  if (currentValue !== null && currentValue !== undefined) {
    currentPriceInCentsString = String(currentValue).replace(/\D/g, '');
  }

  if (!/^\d$/.test(key) && key !== 'Backspace') {
    event.preventDefault();
    return;
  }

  let newBaseSalaryString = currentPriceInCentsString;

  if (key === 'Backspace') {
    newBaseSalaryString = newBaseSalaryString.slice(0, -1);
    if (newBaseSalaryString.length === 0) {
      newBaseSalaryString = '0';
    }
  } else {
    newBaseSalaryString += key;
  }

  newBaseSalaryString = newBaseSalaryString.replace(/^0+(?=\d)/, '');

  const newPriceValueInCents = newBaseSalaryString === '' ? null : parseFloat(newBaseSalaryString);
  
  const valueForVeeValidate = newPriceValueInCents !== null 
    ? (newPriceValueInCents / 100).toFixed(2) 
    : undefined;

  onChange(valueForVeeValidate);
  jobPosition.base_salary = valueForVeeValidate;
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <Form @submit="onSubmit" :initial-values="jobPosition">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedJobPosition?.uuid ? 'Editar Cargo' : 'Novo Cargo' }}
        </v-card-title>
        <v-card-text>
          <Field name="title" label="título" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Título"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedJobPosition?.title"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>
          <Field name="description" label="descrição" rules="required" v-slot="{ field, errorMessage }">
            <v-textarea
              v-bind="field"
              label="Descrição"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedJobPosition?.description"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>
          <Field name="cbo_code" label="código do CBO" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Código do CBO"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedJobPosition?.cbo_code"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>
          <Field name="base_salary" label="remuneração base" rules="min:0" v-slot="{ field, errorMessage, value }">
            <v-text-field
              v-bind="field"
              :model-value="displayFormattedValue"
              label="Remuneração base (R$)"
              prefix="R$"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedJobPosition?.base_salary"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
              @keydown.prevent="handleBaseSalaryKeydown($event, value, field.onChange)"
            />
          </Field>
          <Field name="levelGroup" label="nível do cargo" v-slot="{ field, errorMessage }">
            <v-select
              v-bind="field"
              label="Níveis do Cargo"
              :items="levelsGroupStore.levelsGroupsOptions"
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