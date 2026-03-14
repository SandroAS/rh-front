import { computed, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePlanStore } from '@/stores/plan.store';

export type BillingInterval = 'monthly' | 'yearly';

interface PlanSummary {
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  userLimit: number | null;
}

export function useCheckoutPlan(billingInterval: Ref<BillingInterval>) {
  const route = useRoute();
  const planStore = usePlanStore();

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

  const totalPrice = computed(() => {
    const plan = selectedPlan.value;
    if (!plan || plan.userLimit === null) return null;
    const monthly =
      plan.monthlyPrice ?? (plan.yearlyPrice != null ? plan.yearlyPrice / 12 : null);
    const yearly =
      plan.yearlyPrice ?? (plan.monthlyPrice != null ? plan.monthlyPrice * 12 : null);
    if (billingInterval.value === 'monthly')
      return monthly != null ? Math.round(monthly * 100) / 100 : null;
    return yearly != null ? Math.round(yearly * 100) / 100 : null;
  });

  const priceLabel = computed(() =>
    billingInterval.value === 'monthly' ? 'Valor mensal' : 'Valor anual'
  );

  const showBillingInterval = computed(() => {
    const plan = selectedPlan.value;
    return plan != null && plan.userLimit !== null;
  });

  const formatPrice = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return {
    planSlug,
    planName,
    selectedPlan,
    totalPrice,
    priceLabel,
    showBillingInterval,
    formatPrice,
    planStore,
  };
}
