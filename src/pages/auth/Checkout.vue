<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlanStore } from '@/stores/plan.store';
import { useViaCepStore } from '@/stores/via-cep.store';
import { Form, Field } from '@/plugins/vee-validate';
import { BrazilianStates } from '@/services/via-cep.service';
const logoHorizontal = '/logo-horizontal.jpeg';

type PaymentMethod = 'pix' | 'card' | 'boleto';
type BillingInterval = 'monthly' | 'yearly';

const route = useRoute();
const router = useRouter();
const planStore = usePlanStore();
const viaCepStore = useViaCepStore();

const paymentMethod = ref<PaymentMethod>('pix');
const billingInterval = ref<BillingInterval>('yearly');

const planSlug = computed(() => (route.query.plan as string) ?? '');
const planName = computed(() => {
  const slug = planSlug.value.toLowerCase();
  const names: Record<string, string> = {
    starter: 'Starter',
    growth: 'Growth',
    enterprise: 'Enterprise',
  };
  return names[slug] ?? (planSlug.value || 'Plano');
});

interface PlanSummary {
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  userLimit: number | null;
}

const selectedPlan = computed<PlanSummary | null>(() => {
  if (!planSlug.value) return null;
  const slug = planSlug.value.toLowerCase();
  let monthlyPrice: number | null = null;
  let yearlyPrice: number | null = null;
  let userLimit: number | null = null;
  for (const p of planStore.plans) {
    const s = (p.slug ?? p.name.toLowerCase()).toLowerCase();
    if (s !== slug) continue;
    userLimit = p.user_limit;
    if (p.interval === 'monthly') monthlyPrice = p.base_price;
    if (p.interval === 'yearly') yearlyPrice = p.base_price;
  }
  if (monthlyPrice === null && yearlyPrice === null) return null;
  return { monthlyPrice, yearlyPrice, userLimit };
});

/** Valor total exibido no resumo (dinâmico conforme billingInterval) */
const totalPrice = computed(() => {
  const plan = selectedPlan.value;
  if (!plan || plan.userLimit === null) return null;
  const monthly = plan.monthlyPrice ?? (plan.yearlyPrice != null ? plan.yearlyPrice / 12 : null);
  const yearly = plan.yearlyPrice ?? (plan.monthlyPrice != null ? plan.monthlyPrice * 12 : null);
  if (billingInterval.value === 'monthly') return monthly != null ? Math.round(monthly * 100) / 100 : null;
  return yearly != null ? Math.round(yearly * 100) / 100 : null;
});

const priceLabel = computed(() =>
  billingInterval.value === 'monthly' ? 'Valor mensal' : 'Valor anual'
);

/** Exibe seção de recorrência apenas quando o plano tem preço (não é enterprise) */
const showBillingInterval = computed(() => {
  const plan = selectedPlan.value;
  return plan != null && plan.userLimit !== null;
});

const formatPrice = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

onMounted(async () => {
  if (!planStore.plans.length) await planStore.fetchPlans();
});

async function searchAddress(cep: string, setFieldValue: (field: string, value: string) => void) {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return;
  const res = await viaCepStore.fetchAddressByCep(cleaned);
  if (!res || res.erro) return;
  setFieldValue('address.street', res.logradouro);
  setFieldValue('address.neighborhood', res.bairro);
  setFieldValue('address.complement', res.complemento ?? '');
  setFieldValue('address.city', res.localidade);
  const stateEnum = Object.values(BrazilianStates).find((s) => s === res.uf);
  if (stateEnum) setFieldValue('address.state', stateEnum);
  const numEl = document.getElementById('checkout-address-number');
  if (numEl) (numEl as HTMLInputElement).focus();
}

function goBack() {
  router.push({ name: 'home' });
}

function onSubmit() {
  // Integração com API de pagamento será feita depois
  console.log('Checkout submit (placeholder)', { paymentMethod: paymentMethod.value });
}

const paymentOptions: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'pix', label: 'PIX', icon: 'mdi-qrcode' },
  { value: 'card', label: 'Cartão de crédito', icon: 'mdi-credit-card-outline' },
  { value: 'boleto', label: 'Boleto', icon: 'mdi-barcode' },
];
</script>

<template>
  <v-container class="checkout-page py-6" fluid>
    <div class="d-flex align-center mb-6">
      <router-link to="/" class="d-flex align-center text-decoration-none text-grey-darken-3 mr-4">
        <v-img
          :src="logoHorizontal"
          alt="Logo"
          contain
          height="36"
          max-width="140"
        />
      </router-link>
      <v-chip size="small" color="primary" variant="tonal">Checkout</v-chip>
      <v-spacer />
      <v-btn variant="text" color="grey-darken-2" class="text-none" @click="goBack">
        <v-icon start>mdi-arrow-left</v-icon>
        Voltar
      </v-btn>
    </div>

    <v-row align="stretch" justify="center">
      <!-- Coluna esquerda: formulário -->
      <v-col cols="12" lg="7" order="2" order-lg="1">
        <v-card class="checkout-form-card pa-5 pa-sm-6" elevation="2" rounded="xl">
          <h2 class="text-h6 font-weight-bold text-grey-darken-4 mb-4">Dados para pagamento</h2>

          <Form v-slot="{ setFieldValue }" @submit="onSubmit" :initial-values="{}">
            <!-- Recorrência: Mensal / Anual -->
            <div v-if="showBillingInterval" class="mb-6">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">
                Recorrência
              </h3>
              <v-radio-group v-model="billingInterval" hide-details class="mt-0">
                <div class="d-flex flex-wrap gap-3">
                  <v-card
                    :variant="billingInterval === 'monthly' ? 'tonal' : 'elevated'"
                    :color="billingInterval === 'monthly' ? 'primary' : undefined"
                    rounded="lg"
                    class="cursor-pointer flex-grow-1"
                    min-width="140"
                    @click="billingInterval = 'monthly'"
                  >
                    <v-card-text class="d-flex align-center py-3">
                      <v-radio value="monthly" hide-details class="mr-2" />
                      <v-icon icon="mdi-calendar-month-outline" size="22" class="mr-2" />
                      <span class="text-body-2 font-weight-medium">Mensal</span>
                    </v-card-text>
                  </v-card>
                  <v-card
                    :variant="billingInterval === 'yearly' ? 'tonal' : 'elevated'"
                    :color="billingInterval === 'yearly' ? 'primary' : undefined"
                    rounded="lg"
                    class="cursor-pointer flex-grow-1"
                    min-width="140"
                    @click="billingInterval = 'yearly'"
                  >
                    <v-card-text class="d-flex align-center py-3">
                      <v-radio value="yearly" hide-details class="mr-2" />
                      <v-icon icon="mdi-calendar-check-outline" size="22" class="mr-2" />
                      <span class="text-body-2 font-weight-medium">Anual</span>
                      <v-chip size="x-small" color="success" class="ml-2" variant="flat">
                        Economize
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </div>
              </v-radio-group>
            </div>

            <!-- Dados pessoais -->
            <div class="mb-6">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">
                Dados pessoais
              </h3>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <Field name="name" rules="required|min:3" v-slot="{ field, errorMessage }">
                    <v-text-field
                      v-bind="field"
                      label="Nome completo"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
                <v-col cols="12" sm="6">
                  <Field name="email" rules="required|email" v-slot="{ field, errorMessage }">
                    <v-text-field
                      v-bind="field"
                      label="E-mail"
                      type="email"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
                <v-col cols="12" sm="6">
                  <Field
                    name="phone"
                    rules="required|min:14"
                    v-slot="{ field, errorMessage }"
                  >
                    <v-text-field
                      v-bind="field"
                      label="Telefone"
                      v-mask="['(##) #####-####', '(##) ####-####']"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
                <v-col cols="12" sm="6">
                  <Field name="document" rules="required" v-slot="{ field, errorMessage }">
                    <v-text-field
                      v-bind="field"
                      label="CPF"
                      v-mask="'###.###.###-##'"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
              </v-row>
            </div>

            <v-divider class="my-5" />

            <!-- Endereço -->
            <div class="mb-6">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">Endereço</h3>
              <v-row dense>
                <v-col cols="12" sm="4">
                  <Field
                    name="address.cep"
                    rules="required|min:9|max:9"
                    v-slot="{ field, errorMessage, value }"
                  >
                    <v-text-field
                      :model-value="field.value"
                      @update:model-value="field.onChange"
                      @blur="(e: FocusEvent) => { field.onBlur(e); searchAddress(value, setFieldValue); }"
                      label="CEP"
                      v-mask="'#####-###'"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      :loading="viaCepStore.loading"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
                <v-col cols="12" sm="8">
                  <Field name="address.street" rules="required" v-slot="{ field, errorMessage }">
                    <v-text-field
                      :model-value="field.value"
                      @update:model-value="field.onChange"
                      @blur="field.onBlur"
                      label="Logradouro"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
                <v-col cols="12" sm="3">
                  <Field name="address.number" rules="required" v-slot="{ field, errorMessage }">
                    <v-text-field
                      id="checkout-address-number"
                      :model-value="field.value"
                      @update:model-value="field.onChange"
                      @blur="field.onBlur"
                      label="Número"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
                <v-col cols="12" sm="5">
                  <Field name="address.complement" v-slot="{ field, errorMessage }">
                    <v-text-field
                      :model-value="field.value"
                      @update:model-value="field.onChange"
                      @blur="field.onBlur"
                      label="Complemento"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
                <v-col cols="12" sm="4">
                  <Field name="address.neighborhood" rules="required" v-slot="{ field, errorMessage }">
                    <v-text-field
                      :model-value="field.value"
                      @update:model-value="field.onChange"
                      @blur="field.onBlur"
                      label="Bairro"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
                <v-col cols="12" sm="6">
                  <Field name="address.city" rules="required" v-slot="{ field, errorMessage }">
                    <v-text-field
                      :model-value="field.value"
                      @update:model-value="field.onChange"
                      @blur="field.onBlur"
                      label="Cidade"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
                <v-col cols="12" sm="6">
                  <Field name="address.state" rules="required" v-slot="{ field, errorMessage }">
                    <v-select
                      :model-value="field.value"
                      @update:model-value="field.onChange"
                      @blur="field.onBlur"
                      label="Estado"
                      :items="Object.values(BrazilianStates)"
                      variant="solo-filled"
                      density="comfortable"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      hide-details="auto"
                    />
                  </Field>
                </v-col>
              </v-row>
            </div>

            <v-divider class="my-5" />

            <!-- Forma de pagamento -->
            <div class="mb-6">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">
                Forma de pagamento
              </h3>
              <v-radio-group v-model="paymentMethod" hide-details class="mt-0">
                <div class="d-flex flex-wrap gap-3">
                  <v-card
                    v-for="opt in paymentOptions"
                    :key="opt.value"
                    :variant="paymentMethod === opt.value ? 'tonal' : 'elevated'"
                    :color="paymentMethod === opt.value ? 'primary' : undefined"
                    rounded="lg"
                    class="cursor-pointer flex-grow-1"
                    min-width="140"
                    @click="paymentMethod = opt.value"
                  >
                    <v-card-text class="d-flex align-center py-3">
                      <v-radio :value="opt.value" hide-details class="mr-2" />
                      <v-icon :icon="opt.icon" size="22" class="mr-2" />
                      <span class="text-body-2 font-weight-medium">{{ opt.label }}</span>
                    </v-card-text>
                  </v-card>
                </div>
              </v-radio-group>
            </div>

            <v-btn
              type="submit"
              block
              size="x-large"
              color="primary"
              class="font-weight-bold text-none"
              rounded="lg"
              :disabled="!totalPrice"
            >
              <v-icon start>mdi-lock-outline</v-icon>
              Finalizar (em breve)
            </v-btn>
          </Form>
        </v-card>
      </v-col>

      <!-- Coluna direita: resumo do pedido -->
      <v-col cols="12" lg="5" order="1" order-lg="2">
        <div class="sticky-summary">
          <v-card class="checkout-summary-card pa-4" elevation="2" rounded="xl">
            <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-3">
              Resumo do pedido
            </h3>
            <v-divider class="mb-3" />
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-1 font-weight-medium text-grey-darken-3">{{ planName }}</span>
              <v-icon icon="mdi-check-circle" color="success" size="20" />
            </div>
            <template v-if="totalPrice != null && priceLabel">
              <p class="text-caption text-medium-emphasis mb-1">{{ priceLabel }}</p>
              <p class="text-h4 font-weight-black text-primary">
                {{ formatPrice(totalPrice) }}
              </p>
              <p class="text-caption text-grey mt-2">
                Pagamento seguro. Integração com gateway em breve.
              </p>
            </template>
            <template v-else>
              <p class="text-body-2 text-medium-emphasis">
                {{ planSlug === 'enterprise' ? 'Valor sob medida' : 'Selecione um plano' }}
              </p>
            </template>
            <v-divider class="my-3" />
            <div class="d-flex align-center gap-2 text-caption text-medium-emphasis">
              <v-icon icon="mdi-shield-lock-outline" size="18" />
              <span>Ambiente seguro</span>
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-form-card,
.checkout-summary-card {
  background: rgb(var(--v-theme-surface));
}

.sticky-summary {
  position: sticky;
  top: 24px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
