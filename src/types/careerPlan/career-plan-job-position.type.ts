import type JobPositionSimple from '../jobPosition/job-position-simple.type';

export default interface CareerPlanJobPositions {
  uuid: string;
  job_position_uuid: string;
  order: number;
  career_in_ypsilon: boolean;
  ypsilon_after_order: number | null;
  jobPosition: JobPositionSimple;
}
