import type JobPosition from '../jobPosition/job-position.type';
import type User from '../user/user.type';
import type DRDMetric from './drd-metric.type';
import type DRDTopic from './drd-topic.type';

export default interface DRD {
  uuid: string;
  rate: number;
  jobPosition: JobPosition
  drdTopics: DRDTopic[];
  drdMetrics: DRDMetric[];
  createdByUser: User;
}
