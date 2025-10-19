export enum MetricPrefix {
  MAIOR_OU_IGUAL = '>=',
  MENOR_OU_IGUAL = '<=',
}
export interface DRDMetric {
  uuid?: string;
  name: string;
  classification: string;
  type: string;
  prefix: MetricPrefix,
  order: number;
}
