import { computed } from 'vue';
import { usePlanStore } from '@/stores/plan.store';
import type { PlanResponse } from '@/types/plan/plan-response.type';

export const PLAN_SLUG_ORDER = ['starter', 'growth', 'enterprise'] as const;

export interface PlanPackageDisplay {
  id: string;
  uuid: string;
  name: string;
  tagline: string;
  limit: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  yearlyLabel: string;
  cta: string;
  highlight: boolean;
  icon: string;
  features: string[];
}

/** Dados estáticos de apresentação por slug (tagline, features, icon, highlight, cta) */
export const staticBySlug: Record<
  string,
  { tagline: string; cta: string; highlight: boolean; icon: string; features: string[] }
> = {
  starter: {
    tagline: 'Empresas em crescimento',
    cta: 'Assinar agora',
    highlight: false,
    icon: 'mdi-rocket-outline',
    features: [
      'DRDs e Descritivos',
      'Planos de carreira',
      'Avaliações 360',
      'PDIs Individuais',
      'Painel do colaborador',
      'Visão por time',
    ],
  },
  growth: {
    tagline: 'Empresas em expansão',
    cta: 'Assinar agora',
    highlight: true,
    icon: 'mdi-trending-up',
    features: [
      'Tudo do plano Starter',
      'Mais colaboradores e cargos',
      'Múltiplos planos de carreira',
      'Métricas avançadas',
      'Suporte prioritário',
    ],
  },
  enterprise: {
    tagline: 'Escala e customização',
    cta: 'Falar com consultor',
    highlight: false,
    icon: 'mdi-office-building-cog-outline',
    features: [
      'Tudo do plano Growth',
      'Colaboradores ilimitados',
      'Integrações sob medida',
      'Suporte dedicado (CSM)',
      'Treinamento de lideranças',
    ],
  },
};

function groupPlansBySlug(plans: PlanResponse[]): Map<string, PlanResponse[]> {
  const bySlug = new Map<string, PlanResponse[]>();
  for (const plan of plans) {
    const slug = (plan.slug ?? plan.name.toLowerCase()).toLowerCase();
    const list = bySlug.get(slug) ?? [];
    list.push(plan);
    bySlug.set(slug, list);
  }
  return bySlug;
}

function groupedPlansToPackages(bySlug: Map<string, PlanResponse[]>): PlanPackageDisplay[] {
  const result: PlanPackageDisplay[] = [];

  for (const slug of PLAN_SLUG_ORDER) {
    const plans = bySlug.get(slug);
    if (!plans?.length) continue;

    const staticData = staticBySlug[slug] ?? {
      tagline: plans[0].description ?? plans[0].name,
      cta: 'Assinar agora',
      highlight: false,
      icon: 'mdi-package-variant',
      features: [],
    };

    const monthlyPlan = plans.find((p) => p.interval === 'monthly');
    const yearlyPlan = plans.find((p) => p.interval === 'yearly');
    const anyPlan = plans[0];
    const userLimit = anyPlan.user_limit;

    const limit =
      userLimit != null ? `Até ${userLimit} colaboradores` : 'Conforme seu quadro';

    let monthlyPrice: number | null = null;
    let yearlyPrice: number | null = null;
    let yearlyLabel: string;

    if (slug === 'enterprise' || userLimit == null) {
      yearlyLabel = 'Valor sob medida para sua escala';
    } else {
      if (monthlyPlan) monthlyPrice = monthlyPlan.base_price;
      if (yearlyPlan) {
        yearlyPrice = yearlyPlan.base_price;
        const equiv = Math.round(yearlyPlan.base_price / 12);
        yearlyLabel = `R$ ${yearlyPlan.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/ano (equiv. R$ ${equiv.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mês)`;
      } else {
        yearlyLabel = 'Valor sob medida para sua escala';
      }
    }

    const displayName = monthlyPlan?.name ?? yearlyPlan?.name ?? anyPlan.name;
    const name = displayName.replace(/\s+anual$/i, '').trim() || anyPlan.name;
    const uuid = monthlyPlan?.uuid ?? yearlyPlan?.uuid ?? anyPlan.uuid;

    result.push({
      id: slug,
      uuid,
      name,
      tagline: staticData.tagline,
      limit,
      monthlyPrice,
      yearlyPrice,
      yearlyLabel,
      cta: staticData.cta,
      highlight: staticData.highlight,
      icon: staticData.icon,
      features: staticData.features,
    });
  }

  return result;
}

function buildFallbackPackages(): PlanPackageDisplay[] {
  return PLAN_SLUG_ORDER.map((slug) => {
    const s = staticBySlug[slug];
    const limits: Record<string, string> = {
      starter: 'Até 15 colaboradores',
      growth: 'Até 50 colaboradores',
      enterprise: 'Conforme seu quadro',
    };
    const monthly: Record<string, number | null> = {
      starter: 199,
      growth: 399,
      enterprise: null,
    };
    const yearly: Record<string, number> = {
      starter: 1990,
      growth: 3990,
      enterprise: 0,
    };
    const labels: Record<string, string> = {
      starter: 'R$ 1.990/ano (equiv. R$ 166/mês)',
      growth: 'R$ 3.990/ano (equiv. R$ 333/mês)',
      enterprise: 'Valor sob medida para sua escala',
    };
    const names: Record<string, string> = {
      starter: 'Starter',
      growth: 'Growth',
      enterprise: 'Enterprise',
    };
    return {
      id: slug,
      uuid: '',
      name: names[slug],
      tagline: s.tagline,
      limit: limits[slug],
      monthlyPrice: monthly[slug],
      yearlyPrice: slug === 'enterprise' ? null : yearly[slug],
      yearlyLabel: labels[slug],
      cta: s.cta,
      highlight: s.highlight,
      icon: s.icon,
      features: s.features,
    };
  });
}

const fallbackPackages = buildFallbackPackages();

export function usePlanPackages() {
  const planStore = usePlanStore();

  const packages = computed<PlanPackageDisplay[]>(() => {
    if (!planStore.plans.length) return fallbackPackages;
    const bySlug = groupPlansBySlug(planStore.plans);
    return groupedPlansToPackages(bySlug);
  });

  const formatPrice = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return {
    packages,
    formatPrice,
    planStore,
    fallbackPackages,
  };
}
