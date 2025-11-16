import type EvaluationTopic from '../evaluation/evaluation-topic.type';

export default interface Form {
  uuid: string,
  name: string,
  description?: string,
  topics: EvaluationTopic[];
}
