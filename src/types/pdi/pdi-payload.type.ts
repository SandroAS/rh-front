import type PdiGoalPayload from './pdi-goal-payload.type';

export default interface PdiPayload {
  name?: string;
  description?: string | null;
  due_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  user_uuid?: string;
  pdi_category_uuid?: string;
  pdi_goals?: PdiGoalPayload[];
}
