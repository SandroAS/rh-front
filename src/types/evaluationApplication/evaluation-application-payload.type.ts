export default interface EvaluationApplicationPayload {
  evaluation_model_uuid: string;
  type: 'peer' | 'self' | 'leader';
  requested_by_user_uuid: string;
  evaluated_collaborator_uuid: string;
  evaluator_collaborator_uuid: string;
  application_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
}
