import type LevelsGroup from '../jobPositionsLevelsGroup/job-positions-levels-group.type';

export default interface JobPosition {
  uuid: string;
  title: string;
  description: string;
  cbo_code?: string;
  base_salary?: number;
  levelsGroup?: LevelsGroup;
  drd_uuid?: string;
}
