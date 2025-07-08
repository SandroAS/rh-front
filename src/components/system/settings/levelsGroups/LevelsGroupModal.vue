<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { Form, Field } from 'vee-validate';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type LevelsGroupPayload from '@/types/levelsGroup/levels-group-payload.type';
import type LevelsGroup from '@/types/levelsGroup/levels-group.type';
import { useLevelsGroupStore } from '@/stores/levels-group.store';
import type Level from '@/types/level/level.type';

const levelsGroupStore = useLevelsGroupStore();
const snackbarStore = useSnackbarStore();

const props = defineProps<{
  modelValue: boolean,
  selectedLevelsGroup?: LevelsGroup | null
}>();

const emit = defineEmits(['update:modelValue']);

const close = () => emit('update:modelValue', false);

const levelsGroup = reactive<LevelsGroupPayload & { levels: Level[] }>({
  uuid: undefined,
  name: '',
  levels: [{ name: '', amount: undefined }]
});

watch(() => props.selectedLevelsGroup, (val) => {
  levelsGroup.uuid = val?.uuid || undefined;
  levelsGroup.name = val?.name || '';
  levelsGroup.levels = (val?.levels && val.levels.length > 0)
    ? val.levels.map(level => ({ name: level.name, amount: level.amount || undefined }))
    : [{ name: '', amount: undefined }];
}, { immediate: true });

const addLevel = () => {
  levelsGroup.levels.push({ name: '', amount: undefined });
};

const removeLevel = (index: number) => {
  if (levelsGroup.levels.length > 1) {
    levelsGroup.levels.splice(index, 1);
  } else {
    snackbarStore.show('Não é possível remover todos os níveis. Adicione um novo para poder remover este.', 'warning');
  }
};

async function onSubmit(formValues: Record<string, any>) {
  const filteredLevels = levelsGroup.levels.filter(level =>
    level.name.trim() !== '' || (level.amount !== null && level.amount !== 0)
  );

  if (filteredLevels.length === 0) {
    snackbarStore.show('Adicione pelo menos um nível de cargo e remuneração válidos.', 'error');
    return;
  }

  const payload: LevelsGroupPayload = {
    uuid: levelsGroup.uuid,
    name: formValues.name,
    levels: filteredLevels
  };

  try {
    await levelsGroupStore.saveLevelsGroup(payload, payload.uuid);
    snackbarStore.show('Níveis do Cargo salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(levelsGroupStore.error || 'Falha ao salvar níveis do cargo.', 'error');
  }
};

function formatAmountDisplay(index: number) {
  if(props?.selectedLevelsGroup?.levels && props?.selectedLevelsGroup?.levels.length) {
    const valueAsNumber = parseFloat(String(props.selectedLevelsGroup?.levels[index] || '0.00').replace(',', '.'));
    
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
  levelsGroup!.levels[index].amount = Number(valueForVeeValidate);
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="600px">
    <Form @submit="onSubmit" :initial-values="levelsGroup">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedLevelsGroup ? 'Editar Níveis do Cargo' : 'Novo Níveis do Cargo' }}
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

          <div v-for="(level, index) in levelsGroup.levels" :key="index" class="d-flex align-center mb-4">
            <div class="d-flex gap-2 flex-grow-1">
              <Field :name="`levels[${index}].name`" :label="'nível '+(index+1)" rules="required" v-slot="{ field, errorMessage }">
                <v-text-field
                  v-bind="field"
                  v-model="level.name" :label="`Nível ${index + 1}`"
                  variant="outlined"
                  density="compact"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  class="mb-1 w-100"
                />
              </Field>
              <Field :name="`levels[${index}].amount`" :label="'remuneração do nível '+(index+1)" rules="required|min_value:0" v-slot="{ field, errorMessage, value }">
                <v-text-field
                  v-bind="field"
                  :label="`Remuneração nível ${index + 1}`"
                  :model-value="formatAmountDisplay(index)"
                  variant="outlined"
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
              v-if="levelsGroup.levels.length > 1" icon
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
