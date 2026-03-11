import type { UserAvatar } from '../user/user-avatar.type';
import type PdiCategory from './pdi-category.type';
import type PdiGoal from './pdi-goal.type';

export default interface Pdi {
  uuid: string;
  name: string;
  description?: string | null;
  due_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  user?: UserAvatar;
  pdi_category?: PdiCategory;
  pdi_goals?: PdiGoal[];
  createdBy?: UserAvatar;
}
