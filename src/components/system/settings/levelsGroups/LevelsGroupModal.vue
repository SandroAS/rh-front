<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type LevelsGroupPayload from '@/types/levelsGroup/levels-group-payload.type';
import type LevelsGroup from '@/types/levelsGroup/levels-group.type';
import { useLevelsGroupStore } from '@/stores/levels-group.store';

const levelsGroupStore = useLevelsGroupStore();
const snackbarStore = useSnackbarStore();

const props = defineProps<{
  modelValue: boolean,
  selectedLevelsGroup?: LevelsGroup | null
}>();

const emit = defineEmits(['update:modelValue']);

const close = () => emit('update:modelValue', false);

let levelsGroup = reactive<LevelsGroupPayload>({
  uuid: props.selectedLevelsGroup?.uuid || undefined,
  name: props.selectedLevelsGroup?.name || '',
  levels: props.selectedLevelsGroup?.levels || undefined
})

watch(() => props.selectedLevelsGroup, (val) => {
  levelsGroup = {
    name: props.selectedLevelsGroup?.name || '',
    levels: props.selectedLevelsGroup?.levels || undefined
  }
})

async function onSubmit(formValues: Record<string, any>) {
  const levelsGroup: LevelsGroupPayload = formValues as LevelsGroupPayload;

  try {
    await levelsGroupStore.saveLevelsGroup(levelsGroup, props.selectedLevelsGroup?.uuid);
    snackbarStore.show('Níveis do Cargo salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(levelsGroupStore.error || 'Falha ao salvar níveis do cargo.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <Form @submit="onSubmit" :initial-values="levelsGroup">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedLevelsGroup ? 'Editar Níveis do Cargo' : 'Novo Níveis do Cargo' }}
        </v-card-title>
        <v-card-text>
          <Field name="name" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedLevelsGroup?.name"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>
          <Field name="systemModule" rules="required" v-slot="{ field, errorMessage }">
            <v-select
              v-bind="field"
              label="Módulo do Sistema"
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