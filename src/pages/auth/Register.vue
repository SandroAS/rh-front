<script setup lang="ts">
import { ref } from 'vue';
import logo from '@/assets/logo.png';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useUserStore } from '@/stores/user.store';
import { useRouter } from 'vue-router';
import { Form, Field } from '@/plugins/vee-validate';
import type { UserRegister } from '@/types/user/user-register.type';
import TermsOfServiceAndPrivacyPoliciesModal from './TermsOfServiceAndPrivacyPoliciesModal.vue';

const dialog = ref(false)
const typeOfDocument = ref<'terms' | 'privacy'>('terms')

const openDialog = (type: 'terms' | 'privacy') => {
  typeOfDocument.value = type;
  dialog.value = true
}

const snackbarStore = useSnackbarStore();
const userStore = useUserStore();
const router = useRouter();

const showPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);

const clinicTypes = [
  { label: 'Selecione uma opção', value: '', disabled: true },
  { label: 'Odontológica', value: 'odontologica' },
  { label: 'Psicologia (em breve)', value: 'psicologia', disabled: true },
  { label: 'Fisioterapia (em breve)', value: 'fisioterapia', disabled: true },
]

async function onSubmit(formValues: Record<string, any>) {
  const userRegister: UserRegister = formValues as UserRegister;
  try {
    await userStore.signup(userRegister);
    snackbarStore.show('Registro realizado com sucesso! Bem-vindo(a)!', 'success');
    router.push('/system/dashboard');
  } catch (error: any) {
    console.error('Erro no registro:', error);
    snackbarStore.show(userStore.error || 'Falha ao registrar. Tente novamente.', 'error');
  }
};
</script>

<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-8" max-width="480" elevation="10">
      <v-img
        :src="logo"
        height="50"
        contain
        class="mb-6 mx-auto"
      />
      <div class="text-center mb-4">
        <h5 class="text-h6 font-weight-bold">Teste gratuitamente</h5>
        <p class="text-body-2">sem a necessidade de inserir seu cartão de crédito</p>
      </div>

      <Form @submit="onSubmit">
        <Field
          name="name"
          rules="required|min:3|alpha_spaces"
          v-slot="{ field, errorMessage }"
        >
          <v-text-field
            v-bind="field"
            label="Nome"
            prepend-inner-icon="mdi-account"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            class="mb-3"
          />
        </Field>

        <Field
          name="email"
          rules="required|email"
          v-slot="{ field, errorMessage }"
        >
          <v-text-field
            v-bind="field"
            label="E-mail"
            prepend-inner-icon="mdi-email"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            class="mb-3"
          />
        </Field>

        <Field
          name="cellphone"
          rules="required|min:15|max:16"
          v-slot="{ field, errorMessage }"
        >
          <v-text-field
            v-bind="field"
            label="Telefone"
            v-mask="['(##) #####-####', '(##) ####-####']"
            prepend-inner-icon="mdi-phone"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            class="mb-3"
          />
        </Field>

        <Field
          name="cpf"
          rules="required|cpf"
          v-slot="{ field, errorMessage }"
        >
          <v-text-field
            v-bind="field"
            label="CPF"
            v-mask="'###.###.###-##'"
            prepend-inner-icon="mdi-card-account-details"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            class="mb-3"
          />
        </Field>

        <Field
          name="clinicType"
          rules="required"
          v-slot="{ field, errorMessage }"
        >
          <v-select
            v-bind="field"
            label="Tipo de Clínica"
            :items="clinicTypes"
            item-title="label"
            item-value="value"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            class="mb-3"
          >
            <template v-slot:item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :disabled="item.raw.disabled"></v-list-item>
            </template>
          </v-select>
        </Field>

        <Field
          name="password"
          rules="required|min:6"
          v-slot="{ field, errorMessage }"
        >
          <v-text-field
            v-bind="field"
            label="Senha"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            class="mb-1"
          />
        </Field>
        <div class="text-caption text-red mb-3">Nível de segurança da senha: <strong>Baixo</strong></div>

        <Field
          name="confirmPassword"
          rules="required|confirmed:@password"
          v-slot="{ field, errorMessage }"
        >
          <v-text-field
            v-bind="field"
            label="Confirmar senha"
            :type="showConfirmPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock"
            variant="solo-filled"
            density="comfortable"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            class="mb-3"
          />
        </Field>

        <Field
          name="termsAccepted"
          rules="is_true"
          v-slot="{ field, errorMessage }"
        >
          <v-checkbox
            :model-value="field.value"
            @update:model-value="field.onChange"
            :error="!!errorMessage"
            :error-messages="errorMessage"
            class="mb-4"
          >
            <template v-slot:label>
              <span>
                Eu concordo com o
                <a href="#" @click.prevent="openDialog('terms')" class="text-primary font-weight-medium">Termos de serviço</a>
                e
                <a href="#" @click.prevent="openDialog('privacy')" class="text-primary font-weight-medium">Política de Privacidade</a>
              </span>
            </template>
          </v-checkbox>
        </Field>

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          class="mb-2"
          rounded
          :disabled="userStore.loading"
          :loading="userStore.loading"
        >
          Registrar
          <v-icon end>mdi-account-plus</v-icon>
        </v-btn>

        <div class="text-center text-body-2">
          Já possui uma conta? <a href="#" class="text-primary font-weight-medium" @click.prevent="router.push('/auth/login')">Login</a>
        </div>
      </Form>
    </v-card>

    <TermsOfServiceAndPrivacyPoliciesModal v-model="dialog" :modalContentKey="typeOfDocument"/>
  </v-container>
</template>
