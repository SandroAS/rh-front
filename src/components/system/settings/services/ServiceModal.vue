<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useServiceStore } from '@/stores/service.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type Service from '@/types/service/service.type';
import type ServicePayload from '@/types/service/service-payload.type';
import { useSystemModuleStore } from '@/stores/system-module.store';

const serviceStore = useServiceStore();
const snackbarStore = useSnackbarStore();
const systemModuleStore = useSystemModuleStore()

const props = defineProps<{
  modelValue: boolean,
  selectedService?: Service | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

let service = reactive<ServicePayload>({
  uuid: props.selectedService?.uuid || undefined,
  name: props.selectedService?.name || '',
  description: props.selectedService?.description || '',
  price: props.selectedService?.price || '0.00',
  systemModule: props.selectedService?.systemModule || undefined
})

watch(() => props.selectedService, (val) => {
  service = {
    name: props.selectedService?.name || '',
    description: props.selectedService?.description || '',
    price: props.selectedService?.price || '0.00',
    systemModule: props.selectedService?.systemModule || undefined
  }
})

async function onSubmit(formValues: Record<string, any>) {
  const service: ServicePayload = formValues as ServicePayload;

  try {
    await serviceStore.saveService(service, props.selectedService?.uuid);
    snackbarStore.show('Serviço salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(serviceStore.error || 'Falha ao salvar serviço.', 'error');
  }
};

const displayFormattedValue = computed((val) => {
  console.log(val)
  const valueAsNumber = parseFloat(String(props.selectedService?.price || '0.00').replace(',', '.'));
  
  if (isNaN(valueAsNumber) || valueAsNumber === null) {
    return '0,00';
  }

  return valueAsNumber.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
});

function handlePriceKeydown(event: KeyboardEvent, currentValue: string | number | null, onChange: (value: any) => void) {
  const key = event.key;
  
  let currentPriceInCentsString = '';
  if (currentValue !== null && currentValue !== undefined) {
    currentPriceInCentsString = String(currentValue).replace(/\D/g, '');
  }

  if (!/^\d$/.test(key) && key !== 'Backspace') {
    event.preventDefault();
    return;
  }

  let newPriceString = currentPriceInCentsString;

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
  service.price = valueForVeeValidate;
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <Form @submit="onSubmit" :initial-values="service">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedService ? 'Editar Serviço' : 'Novo Serviço' }}
        </v-card-title>
        <v-card-text>
          <Field name="name" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedService?.name"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>
          <Field name="description" rules="required" v-slot="{ field, errorMessage }">
            <v-textarea
              v-bind="field"
              label="Descrição"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedService?.description"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>
          <Field name="price" rules="required|min:0" v-slot="{ field, errorMessage, value }">
            <v-text-field
              v-bind="field"
              :model-value="displayFormattedValue"
              label="Valor (R$)"
              prefix="R$"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedService?.price"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
              @keydown.prevent="handlePriceKeydown($event, value, field.onChange)"
            />
          </Field>
          <Field name="systemModule" rules="required" v-slot="{ field, errorMessage }">
            <v-select
              v-bind="field"
              label="Módulo do Sistema"
              :items="systemModuleStore.systemModulesOptions"
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