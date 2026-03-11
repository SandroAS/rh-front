import type PdiGoalPayload from './pdi-goal-payload.type';

export default interface PdiPayload {
  start_date?: string | null;
  end_date?: string | null;
  user_uuid?: string;
  status?: string;
  pdi_goals?: PdiGoalPayload[];
}
