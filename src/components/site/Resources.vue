<script setup lang="ts">
const recursos = [
  {
    icon: 'mdi-account-arrow-up-outline',
    iconColor: 'primary',
    titulo: 'Planos de Carreira',
    descricao: 'Estruture trilhas de evolução por cargo, com níveis e requisitos claros para cada posição.',
  },
  {
    icon: 'mdi-chart-360',
    iconColor: 'primary',
    titulo: 'Avaliações 360',
    descricao: 'Avalie desempenho com visão completa: autoavaliação, gestor, pares e subordinados.',
  },
  {
    icon: 'mdi-target',
    iconColor: 'primary',
    titulo: 'PDI Individual',
    descricao: 'Planos de desenvolvimento individual com metas e acompanhamento contínuo.',
  },
  {
    icon: 'mdi-file-document-outline',
    iconColor: 'primary',
    titulo: 'DRDs e Descritivos',
    descricao: 'Descritivos de cargos e DRDs organizados para alinhar expectativas e competências.',
  },
];

const beneficios = [
  {
    icon: 'mdi-chart-line',
    titulo: 'Métricas de Desempenho',
    descricao: 'Acompanhe evolução por time, cargo e colaborador com dashboards e relatórios.',
  },
  {
    icon: 'mdi-account-group',
    titulo: 'Painel do Colaborador',
    descricao: 'Cada colaborador enxerga sua trilha, metas e feedback em um só lugar.',
  },
  {
    icon: 'mdi-shield-check',
    titulo: 'Segurança e Privacidade',
    descricao: 'Dados sensíveis de RH protegidos com controle de acesso e boas práticas.',
  },
  {
    icon: 'mdi-arrow-expand-all',
    titulo: 'Visão por Time',
    descricao: 'Líderes acompanham a evolução do time e identificam talentos e gaps.',
  },
  {
    icon: 'mdi-bullseye-arrow',
    titulo: 'Objetivos Alinhados',
    descricao: 'Conecte planos de carreira às avaliações e ao desenvolvimento contínuo.',
  },
  {
    icon: 'mdi-cog',
    titulo: 'Adaptável à sua Empresa',
    descricao: 'Configure cargos, níveis e planos de carreira do jeito que faz sentido para você.',
  },
];
</script>

<template>
  <div>
    <v-container class="py-16">
      <v-row>
        <v-col cols="12" class="text-center">
          <span class="text-primary font-weight-medium">Recursos do módulo</span>
          <h2 class="text-h3 font-weight-bold mt-2 mb-4">
            Tudo para desenvolver carreiras na sua empresa
          </h2>
          <p class="text-body-1 text-medium-emphasis mx-auto" style="max-width: 560px;">
            Ferramentas pensadas para gestão de desempenho, avaliações e evolução de carreira.
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="(recurso, index) in recursos"
          :key="index"
          cols="12"
          md="6"
          lg="3"
        >
          <v-card class="pa-6 h-100" elevation="1" rounded="xl">
            <v-icon
              :color="recurso.iconColor"
              :icon="recurso.icon"
              size="40"
              class="mb-4"
            />
            <h3 class="text-h6 font-weight-bold mb-3">{{ recurso.titulo }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ recurso.descricao }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <section class="beneficios-section py-16">
      <v-container>
        <v-row>
          <v-col cols="12" class="text-center mb-10">
            <h2 class="text-h4 font-weight-bold text-white mb-3">Por que escolher o RH?</h2>
            <p class="text-body-1 text-white text-opacity-90 mx-auto" style="max-width: 480px;">
              Benefícios que fazem a diferença no dia a dia do seu time
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col v-for="(beneficio, index) in beneficios" :key="index" cols="12" sm="6" md="4">
            <v-card
              class="beneficio-card pa-5 h-100"
              elevation="2"
              rounded="xl"
            >
              <div class="d-flex align-start gap-4">
                <v-avatar color="primary" size="48" rounded="lg" variant="tonal">
                  <v-icon :icon="beneficio.icon" color="primary" size="26" />
                </v-avatar>
                <div class="flex-grow-1 min-width-0">
                  <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-2">
                    {{ beneficio.titulo }}
                  </h3>
                  <p class="text-body-2 text-grey-darken-2 mb-0">
                    {{ beneficio.descricao }}
                  </p>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<style scoped>
.beneficios-section {
  background: rgb(var(--v-theme-primary));
}

.beneficio-card {
  background: rgb(var(--v-theme-surface));
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.beneficio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}
</style>
