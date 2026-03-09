/** Intervalo (data/valor) para métrica do usuário. */
export interface UserMetricIntervalDto {
  uuid?: string;
  date: string;
  value: number;
}

/** DTO para sincronizar métricas do usuário (um usuário, uma métrica DRD, vários intervalos). */
export interface SyncUserMetricsDto {
  user_uuid: string;
  drd_metric_uuid: string;
  intervals: UserMetricIntervalDto[];
}
