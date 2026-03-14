<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlanPackages } from '@/composables/usePlanPackages';

const emit = defineEmits<{
  selectPlan: [planId: string];
}>();

const router = useRouter();
const { packages, formatPrice, planStore } = usePlanPackages();

const WHATSAPP_ENTERPRISE_NUMBER = '5531998136678';
const WHATSAPP_ENTERPRISE_MESSAGE =
  'Gostaria de saber mais sobre o plano Enterprise de vocês, podemos conversar sobre?';

onMounted(async () => {
  if (!planStore.plans.length) await planStore.fetchPlans();
});

function onPlanSelect(planId: string) {
  emit('selectPlan', planId);
  if (planId === 'enterprise') {
    const url = `https://wa.me/${WHATSAPP_ENTERPRISE_NUMBER}?text=${encodeURIComponent(WHATSAPP_ENTERPRISE_MESSAGE)}`;
    window.open(url, '_blank');
  } else {
    router.push({ name: 'siteCheckout', query: { plan: planId } });
  }
}
</script>

<template>
  <section class="pricing-plans-section">
    <v-row align="stretch" justify="center" class="pricing-grid">
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
          <div v-if="pkg.highlight" class="pricing-badge">Mais vantajoso</div>

          <div class="pa-6 pa-md-8 flex-grow-1 d-flex flex-column">
            <div class="mb-6">
              <div class="d-flex justify-space-between align-center mb-2">
                <h2 class="text-h5 font-weight-black">{{ pkg.name }}</h2>
                <v-icon
                  :icon="pkg.icon"
                  :color="pkg.highlight ? 'primary' : 'grey-lighten-1'"
                  size="28"
                />
              </div>
              <p class="text-body-2 text-grey-darken-1 font-weight-medium">{{ pkg.tagline }}</p>
              <v-divider class="my-4 opacity-10" />
              <div
                class="d-flex align-center text-primary font-weight-bold text-caption text-uppercase letter-spacing-1"
              >
                <v-icon start icon="mdi-account-group-outline" size="16" />
                {{ pkg.limit }}
              </div>
            </div>

            <div class="mb-8 pricing-value-box">
              <template v-if="pkg.monthlyPrice != null">
                <div class="d-flex align-baseline">
                  <span class="text-h3 font-weight-black">{{ formatPrice(pkg.monthlyPrice) }}</span>
                  <span class="text-subtitle-2 text-grey-darken-1 ml-1">/mês</span>
                </div>
                <div
                  class="text-caption font-weight-bold text-success mt-2 bg-success-lighten-5 d-inline-block px-2 py-1 rounded"
                >
                  {{ pkg.yearlyLabel }}
                </div>
              </template>
              <template v-else>
                <div class="text-h4 font-weight-black">Personalizado</div>
                <p class="text-caption text-grey-darken-1 mt-1">Soluções Enterprise</p>
              </template>
            </div>

            <div class="flex-grow-1">
              <h4 class="text-overline font-weight-black text-grey-lighten-1 mb-3">
                Recursos inclusos
              </h4>
              <v-list density="compact" class="bg-transparent py-0">
                <v-list-item
                  v-for="(feature, idx) in pkg.features"
                  :key="idx"
                  class="px-0 min-height-auto mb-2"
                >
                  <template #prepend>
                    <v-icon color="success" size="18" class="mr-3"
                      >mdi-check-circle-outline</v-icon
                    >
                  </template>
                  <v-list-item-title
                    class="text-body-2 text-grey-darken-3 text-wrap"
                    style="line-height: 1.4"
                  >
                    {{ feature }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>

            <v-btn
              :color="pkg.highlight ? 'primary' : 'grey-darken-4'"
              :variant="pkg.highlight ? 'flat' : 'outlined'"
              size="x-large"
              block
              rounded="lg"
              class="mt-8 font-weight-black text-none"
              style="height: 56px"
              @click="onPlanSelect(pkg.id)"
            >
              {{ pkg.cta }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.pricing-plans-section {
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-grid {
  margin: 0 -8px;
}

.pricing-card {
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  background: rgb(var(--v-theme-surface));
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

.bg-success-lighten-5 {
  background-color: #f0fdf4;
}

@media (max-width: 959px) {
  .pricing-card--featured {
    transform: scale(1);
    margin-top: 10px;
  }
  .pricing-card--featured:hover {
    transform: translateY(-5px);
  }
}
</style>
