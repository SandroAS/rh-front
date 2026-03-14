<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useViaCepStore } from '@/stores/via-cep.store';
import { useSalesStore } from '@/stores/sales.store';
import { BrazilianStates } from '@/services/via-cep.service';
import { Form } from '@/plugins/vee-validate';
import { useCheckoutPlan, type BillingInterval } from '@/composables/useCheckoutPlan';
import {
  SystemModuleCode,
  SYSTEM_MODULE_LABELS,
  type SalePayload,
} from '@/types/sale/sale-payload.type';
import CheckoutBillingInterval from './CheckoutBillingInterval.vue';
import CheckoutPaymentMethodSelector, {
  type PaymentMethod,
} from './CheckoutPaymentMethodSelector.vue';
import CheckoutOrderSummary from './CheckoutOrderSummary.vue';
import CheckoutPersonalAndAddressFields from './CheckoutPersonalAndAddressFields.vue';

const emit = defineEmits<{ submit: [result?: unknown] }>();

const billingInterval = ref<BillingInterval>('yearly');
const paymentMethod = ref<PaymentMethod>('pix');
const viaCepStore = useViaCepStore();
const salesStore = useSalesStore();

/** Módulos incluídos neste checkout (futuro: vir da seleção ou do plano) */
const selectedModuleCodes = ref<SystemModuleCode[]>([SystemModuleCode.CAREER_DEVELOPMENT]);

const {
  planSlug,
  planName,
  totalPrice,
  priceLabel,
  showBillingInterval,
  formatPrice,
  selectedPlanUuid,
  planStore,
} = useCheckoutPlan(billingInterval);

const moduleLabels = computed(() =>
  selectedModuleCodes.value.map((code) => SYSTEM_MODULE_LABELS[code])
);

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

function buildPayload(values: Record<string, unknown>): SalePayload {
  const address = values.address as Record<string, string>;
  return {
    name: (values.name as string) ?? '',
    email: (values.email as string) ?? '',
    phone: (values.phone as string) ?? '',
    document: (values.document as string) ?? '',
    address: {
      cep: address?.cep ?? '',
      street: address?.street ?? '',
      number: address?.number ?? '',
      complement: address?.complement,
      neighborhood: address?.neighborhood ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
    },
    plan_uuid: selectedPlanUuid.value,
    billing_interval: billingInterval.value,
    payment_method: paymentMethod.value,
    module_codes: [...selectedModuleCodes.value],
  };
}

async function onSubmit(values: Record<string, unknown>) {
  const payload = buildPayload(values);
  try {
    const result = await salesStore.createSale(payload);
    emit('submit', result);
  } catch {
    emit('submit');
  }
}
</script>

<template>
  <v-row align="stretch" justify="center">
    <!-- Coluna esquerda: formulário -->
    <v-col cols="12" lg="7" order="2" order-lg="1">
      <v-card class="checkout-form-card pa-5 pa-sm-6" elevation="2" rounded="xl">
        <h2 class="text-h6 font-weight-bold text-grey-darken-4 mb-4">Dados para pagamento</h2>

        <Form v-slot="{ setFieldValue }" :initial-values="{}" @submit="(values: Record<string, unknown>) => onSubmit(values)">
          <CheckoutBillingInterval
            v-model="billingInterval"
            :show="showBillingInterval"
          />

          <CheckoutPersonalAndAddressFields
            :set-field-value="setFieldValue"
            :search-address="(cep) => searchAddress(cep, setFieldValue)"
          />

          <v-divider class="my-5" />

          <CheckoutPaymentMethodSelector v-model="paymentMethod" />

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

    <!-- Coluna direita: resumo -->
    <v-col cols="12" lg="5" order="1" order-lg="2">
      <CheckoutOrderSummary
        :plan-name="planName"
        :total-price="totalPrice"
        :price-label="priceLabel"
        :plan-slug="planSlug"
        :format-price="formatPrice"
        :module-labels="moduleLabels"
      />
    </v-col>
  </v-row>
</template>

<style scoped>
.checkout-form-card {
  background: rgb(var(--v-theme-surface));
}
</style>
