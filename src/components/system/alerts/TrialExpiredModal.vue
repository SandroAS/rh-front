<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/auth.store';
import { useTrialStore } from '@/stores/trial.store';
import { usePlanStore } from '@/stores/plan.store';
import { useRouter } from 'vue-router';
import { usePlanPackages } from '@/composables/usePlanPackages';

const props = defineProps<{
  modelValue: boolean;
  hasTrialExpired?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
const close = () => emit('update:modelValue', false);

const router = useRouter();
const userStore = useUserStore();
const trialStore = useTrialStore();
const planStore = usePlanStore();
const { packages, formatPrice } = usePlanPackages();

const canClose = ref(false);

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) {
      canClose.value = false;
      return;
    }
    try {
      await Promise.all([trialStore.fetchMyTrial(), planStore.fetchPlans()]);
      if (trialStore.isTrialActive) {
        await userStore.fetchUser();
        canClose.value = true;
      } else {
        canClose.value = false;
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar dados do trial:', err);
      canClose.value = false;
    }
  },
  { immediate: true }
);

const moduleHighlights = [
  'Avaliações 360',
  'PDI',
  'Descritivo de Cargos',
  'Plano de Carreira',
];

const WHATSAPP_ENTERPRISE_NUMBER = '5531998136678';
const WHATSAPP_ENTERPRISE_MESSAGE =
  'Gostaria de saber mais sobre o plano Enterprise de vocês, podemos conversar sobre?';

function goToSubscription(planId: string) {
  if (planId === 'enterprise') {
    const url = `https://wa.me/${WHATSAPP_ENTERPRISE_NUMBER}?text=${encodeURIComponent(WHATSAPP_ENTERPRISE_MESSAGE)}`;
    window.open(url, '_blank');
  } else {
    router.push({ path: '/system/checkout', query: { plan: planId } });
  }
  emit('update:modelValue', false);
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    no-click-animation
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card class="pricing-modal-root bg-grey-lighten-5 d-flex flex-column" rounded="0">
      <!-- Top Bar / Action Area -->
      <div class="pricing-top-bar d-flex align-center justify-end pa-4">
        <v-btn
          v-if="canClose"
          icon="mdi-close"
          variant="tonal"
          color="grey-darken-3"
          size="small"
          class="bg-white elevation-1"
          @click="close"
        />
      </div>

      <div class="pricing-scroll-area overflow-y-auto flex-grow-1">
        <v-container class="pb-12 pt-2">
          <!-- Main Header -->
          <header class="text-center mb-10 pricing-header">
            <v-avatar color="primary-lighten-5" size="80" class="mb-4">
              <v-icon color="primary" size="40">mdi-crown-outline</v-icon>
            </v-avatar>
            
            <h1 class="text-h4 font-weight-black mb-3 text-grey-darken-4">
              {{ hasTrialExpired ? 'Seu período de teste encerrou' : 'Escolha o plano ideal para você' }}
            </h1>
            
            <p class="text-subtitle-1 text-grey-darken-1 mx-auto mb-6" style="max-width: 650px;">
              {{ hasTrialExpired 
                ? 'Garanta a continuidade da gestão de desempenho do seu time com nossos planos especializados.' 
                : 'Aproveite o período de teste para conhecer todas as ferramentas. Você pode assinar agora e garantir o desconto anual!' 
              }}
            </p>

            <div class="d-flex flex-wrap justify-center gap-2">
              <v-chip
                v-for="item in moduleHighlights"
                :key="item"
                variant="flat"
                color="white"
                class="elevation-1 font-weight-bold text-primary px-4"
              >
                <v-icon start icon="mdi-check" size="14" />
                {{ item }}
              </v-chip>
            </div>
          </header>

          <!-- Pricing Grid -->
          <v-row align="stretch" justify="center" class="pricing-grid px-2">
            <v-col
              v-for="pkg in packages"
              :key="pkg.id"
              cols="12"
              sm="10"
              md="4"
              class="d-flex"
            >
              <v-card
                class="pricing-card d-flex flex-column w-100"
                :class="{ 'pricing-card--featured': pkg.highlight }"
                elevation="0"
                border
                rounded="xl"
              >
                <!-- Badge for Featured Plan -->
                <div v-if="pkg.highlight" class="pricing-badge">
                  Mais vantajoso
                </div>

                <div class="pa-6 pa-md-8 flex-grow-1 d-flex flex-column">
                  <!-- Card Header -->
                  <div class="mb-6">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <h2 class="text-h5 font-weight-black">{{ pkg.name }}</h2>
                      <v-icon :icon="pkg.icon" :color="pkg.highlight ? 'primary' : 'grey-lighten-1'" size="28" />
                    </div>
                    <p class="text-body-2 text-grey-darken-1 font-weight-medium">{{ pkg.tagline }}</p>
                    <v-divider class="my-4 opacity-10" />
                    <div class="d-flex align-center text-primary font-weight-bold text-caption text-uppercase letter-spacing-1">
                      <v-icon start icon="mdi-account-group-outline" size="16" />
                      {{ pkg.limit }}
                    </div>
                  </div>

                  <!-- Pricing Area -->
                  <div class="mb-8 pricing-value-box">
                    <template v-if="pkg.monthlyPrice != null">
                      <div class="d-flex align-baseline">
                        <span class="text-h3 font-weight-black">{{ formatPrice(pkg.monthlyPrice) }}</span>
                        <span class="text-subtitle-2 text-grey-darken-1 ml-1">/mês</span>
                      </div>
                      <div class="text-caption font-weight-bold text-success mt-2 bg-success-lighten-5 d-inline-block px-2 py-1 rounded">
                        {{ pkg.yearlyLabel }}
                      </div>
                    </template>
                    <template v-else>
                      <div class="text-h4 font-weight-black">Personalizado</div>
                      <p class="text-caption text-grey-darken-1 mt-1">Soluções Enterprise</p>
                    </template>
                  </div>

                  <!-- Features List -->
                  <div class="flex-grow-1">
                    <h4 class="text-overline font-weight-black text-grey-lighten-1 mb-3">Recursos inclusos</h4>
                    <v-list density="compact" class="bg-transparent py-0">
                      <v-list-item
                        v-for="(feature, idx) in pkg.features"
                        :key="idx"
                        class="px-0 min-height-auto mb-2"
                      >
                        <template #prepend>
                          <v-icon color="success" size="18" class="mr-3">mdi-check-circle-outline</v-icon>
                        </template>
                        <v-list-item-title class="text-body-2 text-grey-darken-3 text-wrap" style="line-height: 1.4">
                          {{ feature }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </div>

                  <!-- CTA Button -->
                  <v-btn
                    :color="pkg.highlight ? 'primary' : 'grey-darken-4'"
                    :variant="pkg.highlight ? 'flat' : 'outlined'"
                    size="x-large"
                    block
                    rounded="lg"
                    class="mt-8 font-weight-black text-none"
                    style="height: 56px;"
                    @click="goToSubscription(pkg.id)"
                  >
                    {{ pkg.cta }}
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Footer Info -->
          <footer class="text-center mt-12 pb-6">
            <p class="text-body-2 text-grey-darken-1">
              Precisa de ajuda para escolher? 
              <v-btn 
                variant="text" 
                color="primary" 
                class="px-1 text-none font-weight-bold"
                @click="router.push('/contato-vendas')"
              >
                Fale com nossos especialistas
              </v-btn>
            </p>
            <div class="d-flex justify-center align-center gap-4 mt-4 opacity-40">
              <v-icon icon="mdi-shield-lock-outline" size="small" />
              <span class="text-caption font-weight-bold">Pagamento 100% Seguro</span>
            </div>
          </footer>
        </v-container>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.pricing-modal-root {
  font-family: 'Inter', sans-serif !important;
}

.pricing-top-bar {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  z-index: 100;
  pointer-events: none;
}
.pricing-top-bar .v-btn {
  pointer-events: auto;
}

.pricing-header {
  animation: fadeInDown 0.6s ease-out;
}

.pricing-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-card {
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  background: white;
  position: relative;
  overflow: visible !important;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08) !important;
}

.pricing-card--featured {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  transform: scale(1.03);
  z-index: 2;
}

.pricing-card--featured:hover {
  transform: scale(1.05) translateY(-8px);
}

.pricing-badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgb(var(--v-theme-primary));
  color: white;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 10px rgba(var(--v-theme-primary), 0.3);
}

.pricing-value-box {
  min-height: 90px;
}

.letter-spacing-1 {
  letter-spacing: 0.5px;
}

.min-height-auto {
  min-height: unset !important;
}

.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mobile Adjustments */
@media (max-width: 959px) {
  .pricing-card--featured {
    transform: scale(1);
    margin-top: 10px;
  }
  .pricing-card--featured:hover {
    transform: translateY(-5px);
  }
  .text-h3 {
    font-size: 2.2rem !important;
  }
}

/* Custom colors for contrast */
.bg-success-lighten-5 {
  background-color: #f0fdf4;
}
.text-success {
  color: #15803d !important;
}
</style>
