import type JobPositionSimple from '../jobPosition/job-position-simple.type';
import type CareerPlan from './career-plan.type';

export default interface CareerPlanJobPositions {
  uuid: string;
  job_position_uuid: string;
  jobPosition: JobPositionSimple;
  order: number;
  career_plan_y_uuid?: string;
  careerPlanY?: CareerPlan;
}
