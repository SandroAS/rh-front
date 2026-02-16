import type CareerPlanJobPositions from './career-plan-job-position.type';

export default interface CareerPlanPayload {
  uuid?: string;
  name: string;
  careerPlanJobPositions: CareerPlanJobPositions[];
}
