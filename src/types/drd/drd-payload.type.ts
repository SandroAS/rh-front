import type User from '../user/user.type';
import type DRDLevel from './drd-level.type';
import type DRDMetricPayload from './drd-metric-payload.type';
import type DRDTopic from './drd-topic.type';

export default interface DRDPayload {
  uuid?: string;
  rate: number;
  job_position_uuid?: string;
  drdLevels: DRDLevel[];
  drdTopics: DRDTopic[];
  drdMetrics: DRDMetricPayload[];
  createdByUser: User;
}
