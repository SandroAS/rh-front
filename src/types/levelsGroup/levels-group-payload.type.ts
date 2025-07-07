import type Level from '../level/level.type';

export default interface LevelsGroupPayload {
  uuid?: string;
  name: string;
  levels?: Level[];
}
