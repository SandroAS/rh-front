import type JobPositionInCareer from './job-position-in-career.type';

export default interface CareerPlanPayload {
  uuid?: string;
  name: string;
  jobPositionsInCareer: JobPositionInCareer[];
}
