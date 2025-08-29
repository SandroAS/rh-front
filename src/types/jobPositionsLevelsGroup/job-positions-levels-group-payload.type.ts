import type JobPositionsLevel from '../jobPositionsLevel/job-positions-level.type';

export default interface JobPositionsLevelsGroupPayload {
  uuid?: string;
  name: string;
  jobPositionsLevels?: JobPositionsLevel[];
}
