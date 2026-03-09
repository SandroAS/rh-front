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

/** DRD Metric no response (resumido para match). */
export interface UserMetricResponseDrdMetricDto {
  uuid?: string;
  [key: string]: unknown;
}

/** Resposta da API de métricas do usuário (histórico por intervalo). */
export interface UserMetricResponseDto {
  uuid: string;
  user_id: number;
  drd_metric_id: number;
  date: string;
  value: number;
  drdMetric?: UserMetricResponseDrdMetricDto;
}
