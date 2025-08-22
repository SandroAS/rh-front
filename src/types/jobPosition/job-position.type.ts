import type LevelsGroup from '../levelsGroup/levels-group.type';

export default interface JobPosition {
  uuid: string;
  title: string;
  description: string;
  cbo_code?: string;
  base_salary?: string;
  levelsGroup?: LevelsGroup;
  drd_uuid?: string;
}
