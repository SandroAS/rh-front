import type { UserAvatar } from '@/types/user/user-avatar.type';

/**
 * Item de aplicação pendente (para o avaliador responder), com data limite.
 */
export default interface PendingEvaluationApplicationItem {
  uuid: string;
  name: string;
  expiration_date: string | null;
  evaluated_user: UserAvatar | null;
}
