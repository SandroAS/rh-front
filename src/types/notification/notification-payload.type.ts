import type { EvaluationApplication} from '../evaluationApplication/evaluation-application.type';
import type { NotificationCategory } from './notification.type';

export default interface NotificationPayload {
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
