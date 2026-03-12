<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlanStore } from '@/stores/plan.store';
import Resources from '@/components/site/Resources.vue';
import PricingPlansSection from '@/components/site/PricingPlansSection.vue';
import Contacts from '@/components/site/Contacts.vue';

interface Feature {
  icon: string;
  title: string;
  color: string;
  description: string;
}

interface Screen {
  id: string;
  title: string;
  description: string;
  image: string;
}

const router = useRouter();
const planStore = usePlanStore();

onMounted(async () => {
  await planStore.fetchPlans();
});

const features: Feature[] = [
  {
    icon: 'mdi-chart-timeline-variant',
    title: 'Desempenho em foco',
    color: 'blue-darken-2',
    description:
      'Avaliações 360, PDIs e métricas para acompanhar a evolução de cada colaborador e do time.',
  },
  {
    icon: 'mdi-ladder',
    title: 'Carreiras estruturadas',
    color: 'purple-darken-2',
    description:
      'Planos de carreira por cargo, com níveis e requisitos claros para crescimento interno.',
  },
  {
    icon: 'mdi-view-dashboard-outline',
    title: 'Visão para gestão',
    color: 'teal-darken-2',
    description:
      'Dashboard e relatórios para líderes e RH tomarem decisões baseadas em dados.',
  },
];

const moduleHighlights = ['Avaliações 360', 'PDI', 'Descritivo de Cargos', 'Plano de Carreira'];

const screens: Screen[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Estratégico',
    description: 'Visão geral de colaboradores, times e avaliações em um só lugar.',
    image: '/home-dashboard-preview.png',
  },
  {
    id: 'user-panel',
    title: 'Painel do Colaborador',
    description: 'Trilha de carreira, desempenho e desenvolvimento individual.',
    image: '/home-user-panel-preview.png',
  },
  {
    id: 'career-plans',
    title: 'Planos de Carreira',
    description: 'Estruture níveis e evolução por cargo de forma visual e clara.',
    image: '/home-career-plans-preview.png',
  },
];

function goToRegister() {
  router.push('/auth/register');
}

function scrollToPlans() {
  const el = document.getElementById('plans');
  el?.scrollIntoView({ behavior: 'smooth' });
}
</script>

<template>
  <div id="home" class="home-wrapper">
    <!-- Hero Section -->
    <section class="hero-section overflow-hidden position-relative pt-16 pb-12 pb-md-16">
      <div class="hero-bg-accent"></div>
      <v-container>
        <v-row align="center" class="position-relative">
          <v-col cols="12" md="7" class="text-center text-md-start">
            <div class="d-flex flex-wrap justify-center justify-md-start gap-2 mb-8 animate-fade-in">
              <v-chip
                v-for="item in moduleHighlights"
                :key="item"
                variant="tonal"
                elevation="1"
                color="primary-lighten-5"
                class="text-primary font-weight-black text-uppercase px-4"
                size="small"
                style="letter-spacing: 0.5px;"
              >
                {{ item }}
              </v-chip>
            </div>
            
            <h1 class="text-h3 text-md-h2 font-weight-black mb-6 text-grey-darken-4 main-title">
              Desenvolvimento de carreira que <span class="text-primary">transforma</span> seu time
            </h1>
            
            <p class="text-h6 text-grey-darken-1 font-weight-regular mb-10 hero-subtitle" style="max-width: 580px; line-height: 1.6;">
              Avaliações 360, planos de carreira, PDI e métricas de desempenho em uma única
              plataforma moderna. Estruture a evolução dos seus talentos com clareza.
            </p>
            
            <div class="d-flex flex-column flex-sm-row align-center gap-4">
              <v-btn
                color="primary"
                size="x-large"
                elevation="8"
                rounded="xl"
                class="px-10 font-weight-black text-none cta-primary"
                @click="goToRegister"
              >
                Teste gratuitamente
                <v-icon end icon="mdi-rocket-launch" class="ml-2" />
              </v-btn>
              
              <v-btn
                variant="text"
                color="grey-darken-3"
                size="x-large"
                class="px-8 text-none font-weight-bold"
                @click="scrollToPlans"
              >
                Ver planos e preços
              </v-btn>
            </div>
            
            <div class="mt-6 d-flex align-center justify-center justify-md-start text-grey-darken-1">
              <div class="d-flex align-center bg-white px-4 py-1 rounded-pill elevation-1 border">
                <v-icon size="20" color="success" class="mr-2">mdi-check-decagram</v-icon>
                <span class="text-caption font-weight-bold">Teste grátis por 7 dias</span>
                <v-divider vertical class="mx-3 my-2" />
                <span class="text-caption font-weight-medium">Sem precisar de colocar seu cartão de crédito</span>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="5" class="position-relative d-none d-md-flex justify-center">
            <div class="hero-visual-wrapper">
              <div class="floating-card card-1 elevation-10">
                <v-icon color="primary" size="32">mdi-chart-line</v-icon>
                <div class="ml-3">
                  <div class="text-caption font-weight-bold text-grey">Crescimento</div>
                  <div class="text-subtitle-2 font-weight-black">+24% este mês</div>
                </div>
              </div>
              <div class="floating-card card-2 elevation-12">
                <v-avatar size="32" color="success-lighten-4" class="mr-2">
                  <v-icon color="success" size="18">mdi-account-check</v-icon>
                </v-avatar>
                <span class="text-subtitle-2 font-weight-black">PDI Concluído</span>
              </div>
              <v-avatar size="380" rounded="xl" color="white" class="elevation-4 main-hero-avatar">
                <v-icon size="180" color="primary-lighten-4">mdi-account-group</v-icon>
              </v-avatar>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Diferenciais -->
    <section class="py-16 bg-white section-divider">
      <v-container>
        <v-row class="mb-12">
          <v-col cols="12" class="text-center">
            <h2 class="text-h4 text-md-h3 font-weight-black text-grey-darken-4">Por que escolher o nosso sistema?</h2>
            <p class="text-body-1 text-grey-darken-1 mt-4">Tudo em um só lugar para uma gestão moderna e eficiente.</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            v-for="feat in features"
            :key="feat.title"
            cols="12"
            md="4"
            class="d-flex"
          >
            <v-card class="feature-card pa-8 w-100 transition-swing" border elevation="0" rounded="xl">
              <!-- Correção aqui: fechamento da crase após o feat.color -->
              <div :class="`feature-icon-box bg-${feat.color} mb-6 shadow-sm`">
                <v-icon size="32" color="white">{{ feat.icon }}</v-icon>
              </div>
              <h3 class="text-h5 font-weight-black mb-4 text-grey-darken-4">{{ feat.title }}</h3>
              <p class="text-body-1 text-grey-darken-1 mb-0" style="line-height: 1.6;">{{ feat.description }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <Resources id="resources" />

    <!-- Preview das Telas -->
    <section class="py-16 bg-grey-lighten-5">
      <v-container>
        <v-row class="mb-12 align-center">
          <v-col cols="12" md="6">
            <span class="text-primary font-weight-black text-uppercase letter-spacing-1">Experiência do Usuário</span>
            <h2 class="text-h3 font-weight-black mt-2 text-grey-darken-4">
              Interface que seu time <br class="d-none d-md-block"> vai adorar usar
            </h2>
          </v-col>
          <v-col cols="12" md="6">
            <p class="text-body-1 text-grey-darken-1">
              Desenhamos cada detalhe para que o RH tenha menos trabalho operacional e os colaboradores tenham clareza total sobre seu crescimento.
            </p>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col
            v-for="screen in screens"
            :key="screen.id"
            cols="12"
            md="4"
            class="d-flex"
          >
            <v-card class="screen-preview-card border-0 w-100" rounded="xl" elevation="4">
              <v-hover v-slot="{ isHovering, props }">
                <div v-bind="props" class="overflow-hidden bg-grey-lighten-3">
                  <v-img
                    :src="screen.image"
                    :alt="screen.title"
                    cover
                    aspect-ratio="16/9"
                    class="transition-transform duration-500"
                    :style="isHovering ? 'transform: scale(1.08)' : ''"
                  >
                    <template #placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="primary" />
                      </v-row>
                    </template>
                  </v-img>
                </div>
              </v-hover>
              <v-card-text class="pa-6">
                <h3 class="text-h6 font-weight-black mb-2">{{ screen.title }}</h3>
                <p class="text-body-2 text-grey-darken-1 mb-0 line-clamp-2">{{ screen.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Planos -->
    <section id="plans" class="py-16 pricing-section position-relative">
      <v-container>
        <v-row justify="center" class="mb-12">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="text-h3 font-weight-black mb-4">
              Investimento que se paga
            </h2>
            <p class="text-h6 text-primary-lighten-4 opacity-80 font-weight-regular">
              Reduza o turnover e aumente o engajamento com planos que cabem no orçamento da sua empresa.
            </p>
          </v-col>
        </v-row>
        
        <div class="pricing-wrapper rounded-xl pa-1 pa-md-4 bg-white-opacity-10 shadow-lg">
          <PricingPlansSection />
        </div>

        <div class="text-center mt-12">
          <p class="text-body-1 opacity-80">
            Dúvidas sobre qual plano escolher?
            <v-btn
              variant="flat"
              color="white"
              class="ml-2 text-primary font-weight-black text-none rounded-pill"
              href="https://wa.me/5531998136678"
              target="_blank"
            >
              Falar com consultor
            </v-btn>
          </p>
        </div>
      </v-container>
    </section>

    <Contacts id="contacts" />
  </div>
</template>

<style scoped>
.home-wrapper {
  overflow-x: hidden;
}

.hero-section {
  background-color: #fafafa;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.hero-bg-accent {
  position: absolute;
  top: -10%;
  right: -5%;
  width: 50%;
  height: 120%;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.08) 0%, transparent 70%);
  z-index: 0;
}

.main-title {
  letter-spacing: -1.5px !important;
  line-height: 1.1;
}

.hero-visual-wrapper {
  position: relative;
  width: 100%;
  max-width: 450px;
}

.main-hero-avatar {
  border: 8px solid white;
  background: linear-gradient(135deg, #fff 0%, #f0f4ff 100%);
}

.floating-card {
  position: absolute;
  background: white;
  padding: 12px 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  z-index: 5;
  animation: float 4s ease-in-out infinite;
}

.card-1 {
  top: 10%;
  left: -20px;
}

.card-2 {
  bottom: 15%;
  right: -10px;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.feature-card {
  transition: all 0.3s ease;
  border: 1px solid #eee !important;
}

.feature-card:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.05) !important;
}

.feature-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen-preview-card {
  overflow: hidden;
  transition: transform 0.3s ease;
}

.pricing-section {
  padding-top: 100px;
  padding-bottom: 100px;
  margin-top: 40px;
}

.pricing-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.letter-spacing-1 {
  letter-spacing: 2px !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }

@media (max-width: 600px) {
  .main-title {
    font-size: 2.2rem !important;
  }
}
</style>
