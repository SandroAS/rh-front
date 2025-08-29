import type JobPositionsLevel from '../jobPositionsLevel/job-positions-level.type';

export default interface JobPositionsLevelsGroup {
  uuid: string;
  name: string;
  jobPositionsLevels: JobPositionsLevel[];
}
