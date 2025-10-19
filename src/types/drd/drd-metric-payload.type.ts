import type DRDLevelMinScorePayload from './drd-level-min-score-payload.type';
import type { MetricPrefix } from './drd-metric.type';

export default interface DRDMetricPayload {
  uuid?: string;
  name: string;
  classification: string;
  type: string;
  prefix: MetricPrefix;
  order: number;
  scoresByLevel: DRDLevelMinScorePayload[]
}
