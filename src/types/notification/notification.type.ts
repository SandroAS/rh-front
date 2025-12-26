import type { EvaluationApplication } from '../evaluationApplication/evaluation-application.type';

export enum NotificationCategory {
  INFO = 'INFO',
  WARNING = 'WARNING',
  URGENT = 'URGENT',
}
 
export default interface Notification {
  uuid: string;
  user_uuid: string;
  category: NotificationCategory;
  template_key: string;
  evaluation_application_uuid?: string;
  evaluationApplication?: EvaluationApplication;
  viewed_at?: Date;
  is_hidden: boolean;
  redirect_url?: string;
  created_at: Date;
}
