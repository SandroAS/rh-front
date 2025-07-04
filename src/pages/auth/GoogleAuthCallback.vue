<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user.store';
import TermsOfServiceAndPrivacyPoliciesModal from './TermsOfServiceAndPrivacyPoliciesModal.vue';

const dialog = ref(false)
const typeOfDocument = ref<'terms' | 'privacy'>('terms')

const openDialog = (type: 'terms' | 'privacy') => {
  typeOfDocument.value = type;
  dialog.value = true
}

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loadingCompletingAuthentication = ref(false);

function tokenNotFoundOnUrl() {
  console.error('Token não encontrado na URL de callback. Possível erro de autenticação.');
  userStore.error = 'Nenhum token recebido do Google.';
  router.push('/auth/login');
}

async function completeAuthentication() {
  const token = route.query.token as string;

  if (token) {
    try {
      userStore.loading = true;
      if(userStore.user?.uuid) {
        await userStore.termsAcceptedAfterGoogleAuthCallback(userStore.user?.uuid);
      } else {
        console.warn('Usuário autenticou pelo google sem aceitar os Termos de Serviço e Política de Privacidade.');
      }
      router.push('/system/dashboard');
    } catch (err) {
      console.error('Erro ao buscar dados do usuário após login Google:', err);
    } finally {
      userStore.loading = false;
    }
  } else {
    tokenNotFoundOnUrl()
  }
}

userStore.loading = true;

onMounted(async () => {
  const token = route.query.token as string;
  const error = route.query.error as string | undefined;

  if (error) {
    console.error('Erro no callback do Google:', error);
    userStore.error = 'Falha na autenticação Google: ' + error;
    userStore.logout()
    return;
  }

  if (token) {
    await userStore.handleAuthSuccess(token);
    const user = userStore.user;
    if(user?.userMetas?.length && (user.userMetas.some(userMeta => userMeta.key === 'TERMS_OF_SERVICE') && user.userMetas.some(userMeta => userMeta.key === 'PRIVACY_POLICIES'))) {
      router.push('/system/dashboard');
    }
    userStore.loading = false;
  } else {
    tokenNotFoundOnUrl()
  }
});
</script>

<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-8 text-center" max-width="400" elevation="10" rounded="xl">
      <v-progress-circular
        v-if="userStore.loading"
        indeterminate
        color="primary"
        size="64"
        width="6"
      ></v-progress-circular>
      <p v-if="userStore.error && !userStore.loading" class="text-red text-center">{{ userStore.error }}</p>
      <template v-if="!loadingCompletingAuthentication">
        <v-card-title class="mt-4">Antes de finalizarmos</v-card-title>
        <v-card-text>
          <span>
            Leia e aceite nossos
            <a href="#" @click.prevent="openDialog('terms')" class="text-primary font-weight-medium">Termos de serviço</a>
            e
            <a href="#" @click.prevent="openDialog('privacy')" class="text-primary font-weight-medium">Política de Privacidade</a>
          </span>
        </v-card-text>
        <v-btn block rounded color="primary" @click="completeAuthentication">Aceito</v-btn>
      </template>
      <template v-else>
        <v-card-title class="mt-4">Autenticando...</v-card-title>
        <v-card-text>Por favor, aguarde enquanto processamos seu login.</v-card-text>
      </template>
    </v-card>

    <TermsOfServiceAndPrivacyPoliciesModal v-model="dialog" :modalContentKey="typeOfDocument"/>

  </v-container>
</template>