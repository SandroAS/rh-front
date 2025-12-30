import type EvaluationMetricAnswer from './evaluation-metric-answer.type';

export default interface EvaluationMetricResponse {
  uuid: string;
  is_completed: boolean;
  submitted_at: string;
  answers: EvaluationMetricAnswer[];
}
