export enum MetricPrefix {
  MAIOR_OU_IGUAL = '>=',
  MENOR_OU_IGUAL = '<=',
}

/** Tipos de métrica do DRD (percentual, quantidade, durações). */
export enum MetricType {
  PERCENTAGE = 'PERCENTAGE',
  QUANTITY = 'QUANTITY',
  DURATION_MONTHS = 'DURATION_MONTHS',
  DURATION_WEEKS = 'DURATION_WEEKS',
  DURATION_DAYS = 'DURATION_DAYS',
  DURATION_HOURS = 'DURATION_HOURS',
  DURATION_MINUTES = 'DURATION_MINUTES',
}

export type MetricTypeClassification = 'NUMBER' | 'DURATION';

export interface MetricTypeOption {
  title: string;
  shortTitle: string;
  icon: string;
  classification: MetricTypeClassification;
  suffix: string;
  color: string;
}

/** Opções por tipo de métrica: usado em DRDModal (formulário) e UserCareerPlanCard (exibição). */
export const METRIC_TYPE_OPTIONS: Record<MetricType, MetricTypeOption> = {
  [MetricType.PERCENTAGE]: { title: 'Percentual', shortTitle: 'Pct.', icon: 'mdi-percent-outline', classification: 'NUMBER', suffix: '%', color: 'blue' },
  [MetricType.QUANTITY]: { title: 'Quantidade', shortTitle: 'Qtd.', icon: 'mdi-tune-variant', classification: 'NUMBER', suffix: '', color: 'purple' },
  [MetricType.DURATION_MONTHS]: { title: 'Meses', shortTitle: 'Mês', icon: 'mdi-calendar-month', classification: 'DURATION', suffix: 'm', color: 'teal' },
  [MetricType.DURATION_WEEKS]: { title: 'Semanas', shortTitle: 'Sem.', icon: 'mdi-calendar-range', classification: 'DURATION', suffix: 'sem', color: 'cyan' },
  [MetricType.DURATION_DAYS]: { title: 'Dias', shortTitle: 'Dia', icon: 'mdi-calendar', classification: 'DURATION', suffix: 'd', color: 'orange' },
  [MetricType.DURATION_HOURS]: { title: 'Horas', shortTitle: 'Hrs.', icon: 'mdi-clock-outline', classification: 'DURATION', suffix: 'h', color: 'indigo' },
  [MetricType.DURATION_MINUTES]: { title: 'Minutos', shortTitle: 'Min.', icon: 'mdi-timer-outline', classification: 'DURATION', suffix: 'min', color: 'deep-orange' },
};

/** Retorna a opção do tipo de métrica (aceita string para uso com dados da API). */
export function getMetricTypeOption(type: string): MetricTypeOption | undefined {
  return METRIC_TYPE_OPTIONS[type as MetricType];
}

export interface DRDMetric {
  uuid?: string;
  name: string;
  classification: string;
  type: string;
  prefix: MetricPrefix,
  order: number;
}
