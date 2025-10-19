export default interface DRDLevelMinScorePayload {
  uuid?: string;
  drd_level_uuid?: string;
  drd_level_order: number;
  drd_topic_item_uuid?: string;
  drd_topic_item_order?: number;
  drd_metric_uuid?: string;
  drd_metric_order?: number;
  min_score: number;
}
