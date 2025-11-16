import type EvaluationTopic from '../evaluation/evaluation-topic.type';

export default interface FormPayload {
  uuid?: string;
  name: string;
  topics: EvaluationTopic[];
}
