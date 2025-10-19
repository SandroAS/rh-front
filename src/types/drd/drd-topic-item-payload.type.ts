import type DRDLevelMinScorePayload from './drd-level-min-score-payload.type';

export default interface DRDTopicItemPayload {
  uuid?: string;
  name: string;
  order: number;
  scoresByLevel: DRDLevelMinScorePayload[]
}
