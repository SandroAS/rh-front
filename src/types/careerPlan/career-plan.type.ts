import type CareerPlanJobPositions from './career-plan-job-position.type';

export default interface CareerPlan {
  uuid: string;
  name: string;
  careerPlanJobPositions: CareerPlanJobPositions[];
}
