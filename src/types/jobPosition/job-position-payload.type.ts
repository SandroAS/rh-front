import type LevelsGroup from '../levelsGroup/levels-group.type';

export default interface JobPositionPayload {
  uuid?: string;
  name: string;
  description: string;
  levelsGroup?: LevelsGroup;
}
