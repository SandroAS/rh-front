import type LevelsGroup from '../levelsGroup/levels-group.type';

export default interface JobPosition {
  uuid: string;
  name: string;
  description: string;
  levelsGroup: LevelsGroup;
  drd_uuid: string;
}
