<script setup lang="ts">
import { Field } from '@/plugins/vee-validate';
import { BrazilianStates } from '@/services/via-cep.service';
import { useViaCepStore } from '@/stores/via-cep.store';

const viaCepStore = useViaCepStore();

defineProps<{
  setFieldValue: (field: string, value: string) => void;
  searchAddress: (cep: string) => Promise<void>;
}>();
</script>

<template>
  <div>
    <!-- Dados pessoais -->
    <div class="mb-6">
      <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">Dados pessoais</h3>
      <v-row dense>
        <v-col cols="12" sm="6">
          <Field name="name" rules="required|min:3" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome completo"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              hide-details="auto"
            />
          </Field>
        </v-col>
        <v-col cols="12" sm="6">
          <Field name="email" rules="required|email" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="E-mail"
              type="email"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              hide-details="auto"
            />
          </Field>
        </v-col>
        <v-col cols="12" sm="6">
          <Field name="phone" rules="required|min:14" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Telefone"
              v-mask="['(##) #####-####', '(##) ####-####']"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              hide-details="auto"
            />
          </Field>
        </v-col>
        <v-col cols="12" sm="6">
          <Field name="document" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="CPF"
              v-mask="'###.###.###-##'"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              hide-details="auto"
            />
          </Field>
        </v-col>
      </v-row>
    </div>

    <v-divider class="my-5" />

    <!-- Endereço -->
    <div class="mb-6">
      <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">Endereço</h3>
      <v-row dense>
        <v-col cols="12" sm="4">
          <Field
            name="address.cep"
            rules="required|min:9|max:9"
            v-slot="{ field, errorMessage, value }"
          >
            <v-text-field
              :model-value="field.value"
              @update:model-value="field.onChange"
              @blur="(e: FocusEvent) => { field.onBlur(e); searchAddress(value); }"
              label="CEP"
              v-mask="'#####-###'"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              :loading="viaCepStore.loading"
              hide-details="auto"
            />
          </Field>
        </v-col>
        <v-col cols="12" sm="8">
          <Field name="address.street" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              :model-value="field.value"
              @update:model-value="field.onChange"
              @blur="field.onBlur"
              label="Logradouro"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              hide-details="auto"
            />
          </Field>
        </v-col>
        <v-col cols="12" sm="3">
          <Field name="address.number" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              id="checkout-address-number"
              :model-value="field.value"
              @update:model-value="field.onChange"
              @blur="field.onBlur"
              label="Número"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              hide-details="auto"
            />
          </Field>
        </v-col>
        <v-col cols="12" sm="5">
          <Field name="address.complement" v-slot="{ field, errorMessage }">
            <v-text-field
              :model-value="field.value"
              @update:model-value="field.onChange"
              @blur="field.onBlur"
              label="Complemento"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              hide-details="auto"
            />
          </Field>
        </v-col>
        <v-col cols="12" sm="4">
          <Field name="address.neighborhood" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              :model-value="field.value"
              @update:model-value="field.onChange"
              @blur="field.onBlur"
              label="Bairro"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              hide-details="auto"
            />
          </Field>
        </v-col>
        <v-col cols="12" sm="6">
          <Field name="address.city" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              :model-value="field.value"
              @update:model-value="field.onChange"
              @blur="field.onBlur"
              label="Cidade"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              hide-details="auto"
            />
          </Field>
        </v-col>
        <v-col cols="12" sm="6">
          <Field name="address.state" rules="required" v-slot="{ field, errorMessage }">
            <v-select
              :model-value="field.value"
              @update:model-value="field.onChange"
              @blur="field.onBlur"
              label="Estado"
              :items="Object.values(BrazilianStates)"
              variant="solo-filled"
              density="comfortable"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              hide-details="auto"
            />
          </Field>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
