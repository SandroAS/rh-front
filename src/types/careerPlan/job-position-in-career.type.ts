import type JobPositionOption from '../jobPosition/job-position-option.type';
import type CareerPlanOption from './career-plan-option.type';

export default interface JobPositionInCareer {
  uuid?: string;
  jobPosition: JobPositionOption;
  nextJobPosition: JobPositionOption;
  careerPlanY?: CareerPlanOption;
  order: number;
}
