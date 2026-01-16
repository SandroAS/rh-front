<script setup lang="ts">
import { computed } from 'vue';
import { Field } from '@/plugins/vee-validate';
import { useAccountUserStore } from '@/stores/account-user.store';
import { getInitials } from '@/utils/getInitialsFromName.util';

const accountUserStore = useAccountUserStore();

const props = defineProps<{
  modelValue: 'MANUAL' | '360';
  evaluated360UserUuid: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: 'MANUAL' | '360'];
  'update:evaluated360UserUuid': [value: string[]];
}>();

const creationMode = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const evaluated360UserUuidModel = computed({
  get: () => props.evaluated360UserUuid,
  set: (value) => emit('update:evaluated360UserUuid', value)
});
</script>

<template>
  <v-radio-group v-model="creationMode" hide-details>
    <div class="d-flex gap-2">
      <v-card
        variant="tonal"
        color="primary"
        class="pa-4 w-100 border-blue-custom"
      >
        <v-card-title class="pa-0 mb-2 text-subtitle-1 d-flex justify-space-between">
          <div>Criar aplicações 360 automaticamente</div>
          <div>
            <v-radio value="360"></v-radio>
          </div>
        </v-card-title>
        <v-card-text class="pa-0">
          <p class="mb-3 text-caption">Selecione o(s) usuário(s) que será(ão) avaliado(s). O sistema buscará automaticamente o Líder, Pares e Liderados deste usuário para gerar as aplicações necessárias.</p>
          <Field name="bulk_evaluated_user_uuid" label="Usuário(s) Avaliado(s) (360)" :rules="{required: creationMode === '360'}" v-slot="{ field, errorMessage }">                          
            <v-autocomplete
              :model-value="evaluated360UserUuidModel"
              @update:model-value="(uuidValue: any) => {
                const finalValue = Array.isArray(uuidValue) ? uuidValue.map(v => v.value || v) : (uuidValue ? [uuidValue.value || uuidValue] : []);
                const filteredValue = finalValue.filter(Boolean);
                emit('update:evaluated360UserUuid', filteredValue);
                field.onChange(filteredValue);
              }"
              @blur="field.onBlur"
              label="Selecione o(s) Avaliado(s)"
              :items="accountUserStore.accountUsersOptionsTeams"
              color="blue-grey-lighten-2"
              item-title="title"
              item-value="value"
              variant="solo-filled"
              chips
              closable-chips
              multiple
              :error="!!errorMessage"
              :error-messages="errorMessage"
              :disabled="creationMode === 'MANUAL'"
            >
              <template v-slot:chip="{ props, item }">
                <v-chip
                  v-bind="props"
                  pill
                  size="small"
                  class="mt-1 pl-0"
                >
                  <v-avatar v-if="item.raw.avatar" start class="ml-0">
                    <v-img :src="item.raw.avatar"></v-img>
                  </v-avatar>

                  <v-avatar v-else color="primary" class="mr-1">
                    <span class="text-white">{{ getInitials(item.raw.title) }}</span>
                  </v-avatar>

                  {{ item.raw.title }}
                </v-chip>
              </template>
              <template v-slot:item="{ props, item }">

                <v-list-item v-if="item.raw.avatar"
                  v-bind="props"
                  :prepend-avatar="item.raw.avatar"
                  :title="item.raw.title"
                  :subtitle="item?.raw?.teams?.length ? item?.raw?.teams.map((t: any) => t.name).join(', ') : 'Sem time'"
                  density="compact"
                ></v-list-item>
                <v-list-item v-else
                  v-bind="props"
                  :title="item.raw.title"
                  :subtitle="item?.raw?.teams?.length ? item?.raw?.teams.map((t: any) => t.name).join(', ') : 'Sem time'"
                  density="compact"
                  class="py-0"
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="35">
                      <span class="text-white">{{ getInitials(item.raw.title) }}</span>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </Field>
        </v-card-text>
      </v-card>
      <v-card
        variant="outlined"
        class="pa-4 w-100"
        :border="creationMode === 'MANUAL' ? 'primary md' : 'gray sm'"
      >
        <v-card-title class="pa-0 mb-2 text-subtitle-1 d-flex justify-space-between">
          <div>Criar aplicações manualmente</div>
          <div>
            <v-radio value="MANUAL"></v-radio>
          </div>
        </v-card-title>
        <v-card-text class="pa-0">
          <p class="mb-3 text-caption">Criar manualmente permite definir cada aplicação individualmente. Ideal para edição ou cenários não-padrão.</p>
        </v-card-text>
      </v-card>
    </div>
  </v-radio-group>
</template>
