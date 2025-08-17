<script lang="ts" setup>
import { ref } from 'vue';
import logo from '@/assets/logo.png';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { Form, Field } from '@/plugins/vee-validate';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const showPassword = ref<boolean>(false);

const router = useRouter();
const userStore = useUserStore();
const snackbarStore = useSnackbarStore();

async function onSubmit(formValues: Record<string, any>) {
  const {email, password} = formValues as { email: string, password: string };
  try {
    await userStore.login(email, password);
    router.push('/system/dashboard');
  } catch (err) {
    console.error('Erro no login: ', err);
    snackbarStore.show('Falha ao tentar logar: '+err, 'error');
  }
};

const forgotPassword = () => {
  router.push('/auth/forgot-password');
};

const register = () => {
  router.push('/auth/register');
};

const loginWithGoogle = async () => {
  window.location.href = API_BASE_URL+'/auth/google';
};
</script>

<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-8" max-width="400" elevation="10" rounded="xl">
      <v-card-title class="justify-center mb-6">
        <v-img :src="logo" alt="Logo RH" contain height="50" width="50" class="mr-2" />
        <span class="text-h5 font-weight-bold">RH</span>
      </v-card-title>

      <Form @submit="onSubmit">
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

        <div class="text-end mb-4">
          <v-btn variant="text" class="text-caption" @click="forgotPassword">
            Esqueceu sua senha?
          </v-btn>
        </div>

        <v-btn type="submit" color="primary" block class="mb-4">
          Entrar
          <v-icon end>mdi-login</v-icon>
        </v-btn>

        <v-divider class="my-4"></v-divider>
        <div class="text-center text-caption text-medium-emphasis mb-4">OU</div>

        <v-btn
          block
          class="mb-4"
          variant="outlined"
          color="red"
          @click="loginWithGoogle"
        >
          <v-icon start>mdi-google</v-icon>
          Entrar com Google
        </v-btn>

        <div class="text-center">
          <span class="text-caption mr-1">Não tem uma conta?</span>
          <v-btn variant="outlined" color="teal" @click="register">
            Teste gratuitamente!
          </v-btn>
        </div>
      </Form>
    </v-card>
  </v-container>
</template>
