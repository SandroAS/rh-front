<script setup lang="ts">
import { useUserStore } from '@/stores/user.store';
import { useRouter } from 'vue-router';

const props = defineProps<{
  modelValue: boolean;
  hasTrialExpired?: boolean
}>();

const emit = defineEmits(['update:modelValue']);
const close = () => emit('update:modelValue', false)

const router = useRouter();

// Dados dos planos que você forneceu
const plans = [
  {
    name: 'Essencial Mensal',
    description: '1 administrador + até 3 assistentes. Ideal para clínicas iniciantes.',
    base_price: 200.00,
    interval: 'monthly',
    isBasic: true, // Adiciona uma flag para diferenciar no template se necessário
  },
  {
    name: 'Essencial Anual',
    description: '1 administrador + até 3 assistentes. Versão anual com desconto.',
    base_price: 2000.00,
    interval: 'yearly',
    isBasic: true,
  },
  {
    name: 'Profissional Mensal',
    description: '1 administrador + equipe de profissionais e assistentes. Ideal para clínicas em crescimento.',
    base_price: 200.00,
    price_per_professional: 150.00,
    interval: 'monthly',
    isProfessional: true, // Adiciona uma flag para diferenciar no template se necessário
  },
  {
    name: 'Profissional Anual',
    description: 'Plano completo anual com suporte para múltiplos profissionais.',
    base_price: 2000.00,
    price_per_professional: 1500.00,
    interval: 'yearly',
    isProfessional: true,
  },
];

// Features para os cards de plano, conforme seu exemplo
const basicFeatures = [
  'Gestão de Atestados', 'Gestão de Clientes', 'Dashboard', 'Agendamento', 'Gestão de Usuários',
  'Atendimentos', 'Prontuário', 'Gestão de Receitas', 'Faturamento', 'Gestão de Serviços',
  'Modelos de Documentos', 'Grupos de Permissão', 'Orçamentos'
];

const customFeatures = [
  'Múltiplos profissionais de saúde', 'Todas as funcionalidades inclusas', 'Compartilhamento de pacientes entre profissionais', 'Compartilhamento de agenda entre profissionais'
];

// Função para formatar o preço
const formatPrice = (price: number) => {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const goToSubscriptionPage = (planName: string) => {
  // Você pode passar o nome do plano ou um ID para a página de assinatura
  // para pré-selecionar o plano, por exemplo.
  console.log(`Usuário clicou em assinar o plano: ${planName}`);
  router.push({ path: '/assinatura', query: { plan: planName } });
  // O modal pode ser fechado aqui, se o redirecionamento for considerado o "fim" da interação
  emit('update:modelValue', false);
};

const goToContactSales = () => {
  console.log('Usuário clicou em Falar com Consultor.');
  router.push('/contato-vendas'); // Ou para um formulário de contato
  emit('update:modelValue', false);
};
const currentUser = useUserStore().user;
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    no-click-animation
    fullscreen 
    class="trial-expired-modal"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-4 pa-sm-8 d-flex flex-column" rounded="0" height="100vh">
      <v-btn v-if="!hasTrialExpired"
        icon="mdi-close"
        @click="close"
      ></v-btn>
      <v-container class="flex-grow-1 d-flex flex-column justify-center align-center py-4">

        <v-row>
          <v-col cols="12" class="text-center">
            <v-icon color="info" size="64" class="mb-4">mdi-information</v-icon>
            <template v-if="!hasTrialExpired">
              <h1 class="text-h4 text-sm-h4 font-weight-bold mb-4">
                Você ainda esta no período de Avaliação
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis mb-6">
                Continue aproveitando todas as funcionalidades do nosso sistema, mas fique a vontade caso já queira assinar um dos nossos planos abaixo.
                <br>Seus dados estão seguros e prontos para serem usados!
              </p>
            </template>
            <template v-else>
              <h1 class="text-h4 text-sm-h4 font-weight-bold mb-4">
                Seu Período de Avaliação Encerrou.
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis mb-6">
                Para continuar aproveitando todas as funcionalidades do nosso sistema, escolha um dos planos abaixo.
                <br>Seus dados estão seguros e prontos para serem usados!
              </p>
            </template>
            ou<br>
            <v-btn text class="text-body-1 mt-2" color="primary">
              Entre em contato para uma cotação personalizada baseada na quantidade de profissionais de saúde.
            </v-btn>
          </v-col>
        </v-row>

        <v-row class="flex-grow-1 justify-center w-100 bg-primary rounded-lg">
          <v-col cols="12" md="6" class="d-flex">
            <v-card class="pa-8 flex-grow-1 d-flex flex-column elevation-10" rounded="lg">
              <h2 class="text-h5 font-weight-bold mb-4">Plano Essencial</h2>
              <p class="text-body-1 text-medium-emphasis mb-8">
                Ideal para clínicas com um único profissional de saúde. Inclui todas as funcionalidades
                com usuários ilimitados para equipe administrativa.
              </p>

              <div class="mb-8 mt-auto"> <template v-for="plan in plans" :key="plan.name">
                  <div v-if="plan.name === 'Essencial Mensal'" class="d-flex flex-column">
                    <span class="text-body-1 text-medium-emphasis">{{ plan.name.includes('Mensal') ? 'Mensal' : 'Anual' }}</span>
                    <div class="d-flex align-baseline">
                      <span class="text-h3 font-weight-bold">{{ formatPrice(plan.base_price) }}</span>
                      <span class="text-body-1 text-medium-emphasis">/mês</span>
                    </div>
                    <span class="text-body-2 text-medium-emphasis">
                      ou {{ formatPrice(plans.find(p => p.name === 'Essencial Anual')?.base_price || 0) }}/ano no plano anual
                    </span>
                  </div>
                </template>
              </div>

              <v-btn
                color="primary"
                size="large"
                rounded="lg"
                block
                class="mb-8"
                @click="goToSubscriptionPage('Essencial')"
              >
                Começar agora
              </v-btn>

              <p class="text-primary font-weight-medium mb-6">Inclui</p>
              <v-list density="compact">
                <v-list-item
                  v-for="(feature, index) in basicFeatures"
                  :key="index"
                  class="px-0"
                >
                  <template v-slot:prepend>
                    <v-icon color="primary" size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-body-1">
                    {{ feature }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" class="]">
            <v-card class="pa-8 flex-grow-1 d-flex flex-column elevation-10" rounded="lg">
              <h2 class="text-h5 font-weight-bold mb-4">Plano Profissional</h2>
              <p class="text-body-1 text-medium-emphasis mb-8">
                Perfeito para clínicas com múltiplos profissionais de saúde. Valor personalizado de acordo
                com a quantidade de profissionais. Inclui todas as funcionalidades com usuários ilimitados.
              </p>

              <div class="mb-8 mt-auto"> <template v-for="plan in [plans[2], plans[3]]" :key="plan.name">
                  <div v-if="plan.name === 'Profissional Mensal'" class="d-flex flex-column">
                    <span class="text-body-1 text-medium-emphasis">{{ plan.name.includes('Mensal') ? 'Mensal' : 'Anual' }}</span>
                    <div class="d-flex align-baseline">
                      <span class="text-h3 font-weight-bold">{{ formatPrice(plan.base_price) }}</span>
                      <span class="text-h6 ml-2">+ {{ plan.price_per_professional }}</span>
                      <span class="text-body-1 text-medium-emphasis">/mês</span>
                    </div>
                    <span class="text-body-2 text-medium-emphasis">
                      ou {{ formatPrice(plans.find(p => p.name === 'Profissional Anual')?.base_price || 0) }} + {{ formatPrice(plans.find(p => p.name === 'Profissional Anual')?.price_per_professional || 0) }}/ano no plano anual
                    </span>
                  </div>
                </template>
              </div>

              <v-btn
                color="primary"
                size="large"
                rounded="lg"
                block
                class="mb-8"
                @click="goToContactSales"
              >
                Começar agora
              </v-btn>

              <p class="text-primary font-weight-medium mb-6">Diferenciais</p>
              <v-list density="compact">
                <v-list-item
                  v-for="(feature, index) in customFeatures"
                  :key="index"
                  class="px-0"
                >
                  <template v-slot:prepend>
                    <v-icon color="primary" size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-body-1">
                    {{ feature }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-card {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
