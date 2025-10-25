import type JobPosition from '../jobPosition/job-position.type';
import type { UserAvatar } from '../user/user-avatar.type';
import type DRDLevel from './drd-level.type';
import type { DRDMetric } from './drd-metric.type';
import type DRDTopic from './drd-topic.type';

export default interface DRD {
  uuid: string;
  rate: number;
  jobPosition: JobPosition
  drdLevels: DRDLevel[];
  drdTopics: DRDTopic[];
  drdMetrics: DRDMetric[];
  createdByUser: UserAvatar;
}
