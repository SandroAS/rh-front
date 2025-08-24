import type LevelsGroup from '../jobPositionsLevelsGroup/job-positions-levels-group.type';

export default interface JobPositionPayload {
  uuid?: string;
  title: string;
  description: string;
  cbo_code?: string;
  base_salary?: string;
  levelsGroup?: LevelsGroup;
}
