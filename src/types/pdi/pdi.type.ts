import type PdiGoal from './pdi-goal.type';

/** Status do PDI retornado pela API. */
export enum PdiStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export default interface Pdi {
  uuid: string;
  start_date?: string | null;
  end_date?: string | null;
  user_uuid?: string | null;
  status?: PdiStatus;
  goals?: PdiGoal[];
}
