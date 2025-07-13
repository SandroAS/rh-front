import type JobPositionInCareer from './job-position-in-career.type';

export default interface CareerPlan {
  uuid: string;
  name: string;
  jobPositionsInCareer: JobPositionInCareer[];
}
