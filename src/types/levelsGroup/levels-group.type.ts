import type Level from '../level/level.type';

export default interface LevelsGroup {
  uuid: string;
  name: string;
  levels: Level[];
}
