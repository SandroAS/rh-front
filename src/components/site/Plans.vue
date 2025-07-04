<script setup lang="ts">
const basicFeatures = [
  'Gestão de Atestados',
  'Gestão de Clientes',
  'Dashboard',
  'Agendamento',
  'Gestão de Usuários',
  'Atendimentos',
  'Prontuário',
  'Gestão de Receitas',
  'Faturamento',
  'Gestão de Serviços',
  'Modelos de Documentos',
  'Grupos de Permissão',
  'Orçamentos'
]

const customFeatures = [
  'Múltiplos profissionais de saúde',
  'Todas as funcionalidades inclusas',
  'Valor personalizado por profissional'
]
</script>

<template>
  <div>
    <v-container class="py-16">
      <v-row>
        <v-col cols="12" class="text-center">
          <h1 class="text-h2 font-weight-bold mb-4">
            Planos que se adaptam à sua<br>necessidade
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-16">
            Escolha o plano ideal para sua clínica. Todas as funcionalidades inclusas em<br>todos os planos.
          </p>
        </v-col>
      </v-row>

      <v-row>
        <!-- Plano Básico -->
        <v-col cols="12" md="6">
          <v-card class="pa-8" rounded="lg">
            <h2 class="text-h4 font-weight-bold mb-4">Plano Básico</h2>
            <p class="text-body-1 text-medium-emphasis mb-8">
              Ideal para clínicas com um único profissional de saúde. Inclui todas as funcionalidades
              com usuários ilimitados para equipe administrativa.
            </p>

            <div class="mb-8">
              <span class="text-body-1 text-medium-emphasis">Mensal</span>
              <div class="d-flex align-baseline">
                <span class="text-h3 font-weight-bold">R$200</span>
                <span class="text-body-1 text-medium-emphasis">/mês</span>
              </div>
              <span class="text-body-2 text-medium-emphasis">ou R$2000/ano no plano anual</span>
            </div>

            <v-btn
              color="primary"
              size="large"
              rounded="lg"
              block
              class="mb-8"
            >
              Começar agora
            </v-btn>

            <p class="text-primary font-weight-medium mb-6">Inclui</p>
            <v-list>
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

        <!-- Plano Personalizado -->
        <v-col cols="12" md="6">
          <v-card class="pa-8" rounded="lg">
            <h2 class="text-h4 font-weight-bold mb-4">Plano Personalizado</h2>
            <p class="text-body-1 text-medium-emphasis mb-8">
              Perfeito para clínicas com múltiplos profissionais de saúde. Valor personalizado de acordo
              com a quantidade de profissionais. Inclui todas as funcionalidades com usuários ilimitados.
            </p>

            <div class="mb-8">
              <span class="text-body-1 text-medium-emphasis">Mensal</span>
              <div class="d-flex align-baseline">
                <span class="text-h3 font-weight-bold">R$200</span>
                <span class="text-h6">+ R$2000,00</span>
                <span class="text-body-1 text-medium-emphasis">/mês</span>
              </div>
              <span class="text-body-2 text-medium-emphasis">ou R$2000/ano no plano anual</span>
            </div>

            <v-btn
              color="primary"
              size="large"
              rounded="lg"
              block
              class="mb-8"
            >
              Falar com consultor
            </v-btn>

            <p class="text-primary font-weight-medium mb-6">Diferenciais</p>
            <v-list>
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
  </div>
</template>
