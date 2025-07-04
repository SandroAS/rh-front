<script setup lang="ts">
import { reactive } from 'vue';
import { Form, Field } from '@/plugins/vee-validate'
import { useUserStore } from '@/stores/user.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type { ProfileCompany } from '@/types/profile/profile-company.type';
import { BrazilianStates, viaCepService, type ViaCepResponse } from '@/services/via-cep.service';

const userStore = useUserStore();
const snackbarStore = useSnackbarStore();

const companyDefault = reactive({
  uuid: userStore.user!.companies?.[0].uuid || '',
  name: userStore.user!.companies?.[0].name || '',
  social_reason: userStore.user!.companies?.[0].social_reason || '',
  cnpj: userStore.user!.companies?.[0].cnpj || '',
  cellphone: userStore.user!.companies?.[0].cellphone || '',
  email: userStore.user!.companies?.[0].email || '',
  address: {
    uuid: userStore.user!.companies?.[0].address?.uuid || '',
    cep: userStore.user!.companies?.[0].address?.cep || '',
    street: userStore.user!.companies?.[0].address?.street || '',
    number: userStore.user!.companies?.[0].address?.number || '',
    neighborhood: userStore.user!.companies?.[0].address?.neighborhood || '',
    complement: userStore.user!.companies?.[0].address?.complement || '',
    city: userStore.user!.companies?.[0].address?.city || '',
    state: userStore.user!.companies?.[0].address?.state || ''
  }
});

async function onSubmit(formValues: Record<string, any>) {
  const company: ProfileCompany = formValues as ProfileCompany;
  try {
    await userStore.saveUserCompany(company);
    snackbarStore.show('Usuário atualizado com sucesso!', 'success')
  } catch (err) {
    snackbarStore.show('Falha ao tentar atualizar usuário: '+err, 'error')
  }
}

async function searchAddress(value: string, setFieldValue: Function) {
  if(value.length < 9) return;

  const cleanedCep = value.replace(/\D/g, '');
  try {
    const res: ViaCepResponse | null = await viaCepService.getAddressByCep(cleanedCep);

    if (res && !res.erro) {
      setFieldValue('address.street', res.logradouro);
      setFieldValue('address.neighborhood', res.bairro);
      setFieldValue('address.complement', res.complemento);
      setFieldValue('address.city', res.localidade);

      const stateEnum = Object.values(BrazilianStates).find(s => s === res.uf);
      if (stateEnum) {
        setFieldValue('address.state', stateEnum);
      } else {
        console.warn(`Estado retornado pelo ViaCEP (${res.uf}) não encontrado no ENUM. Limpando campo.`);
        setFieldValue('address.state', '');
      }

      const numberField = document.getElementById('number') as HTMLInputElement | null;
      if (numberField) {
        numberField.focus();
      }

    } else {
      setFieldValue('address.street', '');
      setFieldValue('address.neighborhood', '');
      setFieldValue('address.complement', '');
      setFieldValue('address.city', '');
      setFieldValue('address.state', '');
    }
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <Form v-slot="{ setFieldValue }" @submit="onSubmit" :initial-values="companyDefault">
    <v-row>
      <v-col cols="12" md="4" class="pr-md-6">
        <h5 class="text-subtitle-1 font-weight-medium">Informações da Empresa</h5>
        <p class="text-body-2 text-medium-emphasis">
          Preencha os dados cadastrais da empresa.
        </p>
      </v-col>
  
      <v-col cols="12" md="8">
        <v-row>
          <v-col cols="12" sm="12">
            <Field
              name="name"
              rules="required|min:3"
              v-slot="{ field, errorMessage }"
            >
              <v-text-field
                v-bind="field"
                label="Nome da empresa"
                :persistent-placeholder="!!userStore.user!.companies?.[0].name"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="12">
            <Field
              name="social_reason"
              rules="required|min:3"
              v-slot="{ field, errorMessage }"
            >
              <v-text-field
                v-bind="field"
                label="Razão Social"
                :persistent-placeholder="!!userStore.user!.companies?.[0].social_reason"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="cnpj"
              rules="required|cnpj"
              v-slot="{ field, errorMessage }"
            >
              <v-text-field
                v-bind="field"
                label="CNPJ"
                :persistent-placeholder="!!userStore.user!.companies?.[0].cnpj"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="cellphone"
              rules="required|min:15|max:16"
              v-slot="{ field, errorMessage }"
            >
              <v-text-field
                v-bind="field"
                label="Telefone comer"
                :persistent-placeholder="!!userStore.user!.companies?.[0].cellphone"
                v-mask="['(##) #####-####', '(##) ####-####']"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="12">
            <Field
              name="email"
              rules="required|email"
              v-slot="{ field, errorMessage }"
            >
              <v-text-field
                v-bind="field"
                label="Email comercial"
                :persistent-placeholder="!!userStore.user!.companies?.[0].email"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
                type="email"
              />
            </Field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <Field
              name="address.cep"
              rules="required|min:9|max:9"
              v-slot="{ field, errorMessage, value }"
            >
              <v-text-field
                v-bind="field"
                label="CEP"
                :persistent-placeholder="!!userStore.user!.companies?.[0].address?.cep"
                v-mask="'#####-###'"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
                @keyup="searchAddress(value, setFieldValue)"
              />
            </Field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="8">
            <Field
              name="address.street"
              rules="required"
              v-slot="{ field, errorMessage, value }"
            >
              <v-text-field
                v-bind="field"
                label="Rua"
                :persistent-placeholder="!!userStore.user!.companies?.[0].address?.street || !!value"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="4">
            <Field
              name="address.number"
              rules="required"
              v-slot="{ field, errorMessage }"
            >
              <v-text-field
                id="number"
                v-bind="field"
                label="Número"
                :persistent-placeholder="!!userStore.user!.companies?.[0].address?.number"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="address.neighborhood"
              rules="required"
              v-slot="{ field, errorMessage, value }"
            >
              <v-text-field
                v-bind="field"
                label="Bairro"
                :persistent-placeholder="!!userStore.user!.companies?.[0].address?.neighborhood || !!value"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="address.complement"
              v-slot="{ field, errorMessage, value }"
            >
              <v-text-field
                v-bind="field"
                label="Complemento"
                :persistent-placeholder="!!userStore.user!.companies?.[0].address?.complement || !!value"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="address.city"
              rules="required"
              v-slot="{ field, errorMessage, value }"
            >
              <v-text-field
                v-bind="field"
                label="Cidade"
                :persistent-placeholder="!!userStore.user!.companies?.[0].address?.city || !!value"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>
          <v-col cols="12" sm="6">
            <Field
              name="address.state"
              rules="required"
              v-slot="{ field, errorMessage, value }"
            >
              <v-text-field
                v-bind="field"
                label="Estado"
                :persistent-placeholder="!!userStore.user!.companies?.[0].address?.state || !!value"
                variant="solo-filled"
                density="compact"
                :error="!!errorMessage"
                :error-messages="errorMessage"
              />
            </Field>
          </v-col>

          <v-col cols="12" class="d-flex justify-end">
            <v-btn class="mt-4" color="primary" type="submit">Salvar</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </Form>
</template>