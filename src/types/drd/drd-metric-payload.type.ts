import type DRDLevelMinScorePayload from './drd-level-min-score-payload.type';

export default interface DRDMetricPayload {
  uuid?: string;
  name: string;
  classification: string;
  type: string;
  order: number;
  scoresByLevel: DRDLevelMinScorePayload[]
}
