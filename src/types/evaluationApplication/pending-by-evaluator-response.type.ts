import type { UserAvatar } from '@/types/user/user-avatar.type';
import type PendingEvaluationApplicationItem from './pending-evaluation-application-item.type';

/**
 * Agrupamento por avaliador: dados do avaliador + aplicações pendentes com datas limite.
 */
export default interface PendingByEvaluatorResponse {
  evaluator: UserAvatar;
  pending_applications: PendingEvaluationApplicationItem[];
}
