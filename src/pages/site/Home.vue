<script setup lang="ts">
import Resources from '@/components/site/Resources.vue';
import Plans from '@/components/site/Plans.vue';
import Contacts from '@/components/site/Contacts.vue';

const features = [
  {
    icon: 'mdi-calendar-check',
    title: 'Agendamento Simplificado',
    description: 'Sistema intuitivo para marcação de consultas, com lembretes automáticos para pacientes.'
  },
  {
    icon: 'mdi-file-document',
    title: 'Prontuário Eletrônico',
    description: 'Mantenha todos os registros médicos organizados e acessíveis de forma segura.'
  },
  {
    icon: 'mdi-chart-bar',
    title: 'Gestão Financeira',
    description: 'Controle completo das finanças, com relatórios detalhados e dashboard intuitivo.'
  }
]
</script>

<template>
  <div id="home">
    <v-container class="py-16">
      <v-row align="center" justify="center">
        <v-col cols="12" md="6" class="text-center">
          <h1 class="text-h2 font-weight-bold mb-6">
            Gestão inteligente para sua clínica
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-8">
            Simplifique a gestão da sua clínica com o Soft Clinic. Nossa plataforma
            oferece todas as ferramentas necessárias para otimizar seus processos e
            melhorar o atendimento aos pacientes.
          </p>
          <div class="d-flex flex-column flex-sm-row align-center justify-center gap-4">
            <v-btn color="primary" size="x-large" rounded="lg" class="px-8">
              Teste gratuitamente por 7 dias
            </v-btn>
            <v-btn variant="text" size="x-large" rounded="lg" class="text-primary">
              Saiba mais
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </div>
          <p class="text-caption mt-4">
            <v-icon size="small" color="primary">mdi-check-circle</v-icon>
            Não precisa cadastrar cartão
          </p>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="py-16 bg-accent">
      <v-row>
        <v-col cols="12" class="text-center mb-12">
          <h2 class="text-h4 font-weight-bold mb-4">
            Por que escolher o Soft Clinic?
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Descubra como nossa plataforma pode transformar sua clínica
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4" v-for="feature in features" :key="feature.title">
          <v-card elevation="0" color="transparent">
            <v-card-text class="text-center">
              <v-icon size="48" color="primary" class="mb-4">{{ feature.icon }}</v-icon>
              <h3 class="text-h6 font-weight-bold mb-2">{{ feature.title }}</h3>
              <p class="text-body-2 text-medium-emphasis">{{ feature.description }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <Resources id="resources" />

  <Plans id="plans" />

  <Contacts id="contacts" />
</template>
