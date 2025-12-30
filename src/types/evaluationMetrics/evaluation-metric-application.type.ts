import type { EvaluationType } from '../evaluationApplication/evaluation-application.type';
import type EvaluationMetricResponse from './evaluation-metric-response.type';

export default interface EvaluationMetricApplication {
  uuid: string;
  name: string;
  type: EvaluationType;
  started_date: string;
  evaluated_user: {
    name: string;
    email: string;
  };
  submitting_user: {
    name: string;
    email: string;
  };
  formResponses: EvaluationMetricResponse[];
}
