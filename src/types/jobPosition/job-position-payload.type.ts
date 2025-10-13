import type JobPositionsLevelsGroup from '../jobPositionsLevelsGroup/job-positions-levels-group.type';

export default interface JobPositionPayload {
  uuid?: string;
  title: string;
  description: string;
  cbo_code?: string;
  base_salary?: number;
  job_positions_levels_group_uuid?: string;
}
