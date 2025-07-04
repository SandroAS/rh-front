<script setup lang="ts">
const recursos = [
  {
    icon: 'mdi-account-group',
    iconColor: 'primary',
    titulo: 'Gestão de Pacientes',
    descricao: 'Controle completo de cadastros, histórico médico e agendamentos.'
  },
  {
    icon: 'mdi-calendar-check',
    iconColor: 'primary',
    titulo: 'Agenda Inteligente',
    descricao: 'Sistema avançado de agendamento com lembretes automáticos.'
  },
  {
    icon: 'mdi-file-document',
    iconColor: 'primary',
    titulo: 'Prontuário Eletrônico',
    descricao: 'Registros médicos e odontológicos digitais seguros e de fácil acesso.'
  },
  {
    icon: 'mdi-calculator',
    iconColor: 'primary',
    titulo: 'Faturamento',
    descricao: 'Gestão financeira completa com orçamentos, descontos e métodos de pagamentos.'
  }
]

const beneficios = [
  {
    icon: 'mdi-clock-fast',
    titulo: 'Aumente sua Produtividade',
    descricao: 'Automatize tarefas repetitivas e foque no que realmente importa: seus pacientes.'
  },
  {
    icon: 'mdi-chart-line',
    titulo: 'Controle Financeiro',
    descricao: 'Acompanhe receitas, despesas e fluxo de caixa com relatórios detalhados.'
  },
  {
    icon: 'mdi-shield-check',
    titulo: 'Segurança Total',
    descricao: 'Seus dados e de seus pacientes protegidos com a mais alta tecnologia em segurança.'
  },
  {
    icon: 'mdi-cellphone',
    titulo: 'Acesso Mobile',
    descricao: 'Acesse sua clínica de qualquer lugar através do nosso aplicativo móvel.'
  },
  {
    icon: 'mdi-account-multiple-check',
    titulo: 'Satisfação do Paciente',
    descricao: 'Melhore a experiência dos seus pacientes com agendamento online e comunicação eficiente.'
  },
  {
    icon: 'mdi-cog',
    titulo: 'Personalização',
    descricao: 'Adapte o sistema às necessidades específicas da sua clínica.'
  }
]
</script>

<template>
  <div>
    <v-container class="py-16">
      <v-row>
        <v-col cols="12" class="text-center">
          <span class="text-primary font-weight-medium">Recursos Completos</span>
          <h1 class="text-h2 font-weight-bold mt-4 mb-16">
            Tudo que você precisa para gerenciar<br>sua clínica
          </h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col v-for="(recurso, index) in recursos" :key="index" cols="12" md="6" lg="3">
          <v-card class="pa-8 h-100" elevation="1" rounded="lg">
            <v-icon :color="recurso.iconColor" :icon="recurso.icon" size="x-large" class="mb-6"></v-icon>

            <h3 class="text-h6 font-weight-bold mb-4">
              {{ recurso.titulo }}
            </h3>

            <p class="text-body-1 text-medium-emphasis">
              {{ recurso.descricao }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Seção de Benefícios -->
    <v-container class="py-16 bg-accent">
      <v-row>
        <v-col cols="12" class="text-center mb-12">
          <h2 class="text-h4 font-weight-bold">
            Benefícios do Soft Clinic
          </h2>
          <p class="text-body-1 text-medium-emphasis mt-4">
            Descubra como nossa plataforma pode transformar sua gestão clínica
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col v-for="(beneficio, index) in beneficios" :key="index" cols="12" md="4">
          <v-card class="pa-6" elevation="0" color="transparent">
            <div class="d-flex align-start mb-4">
              <v-icon color="primary" size="24" class="me-4">
                {{ beneficio.icon }}
              </v-icon>
              <h3 class="text-h6 font-weight-bold">
                {{ beneficio.titulo }}
              </h3>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              {{ beneficio.descricao }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
