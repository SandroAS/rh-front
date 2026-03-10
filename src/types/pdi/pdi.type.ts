import type { UserAvatar } from '../user/user-avatar.type';
import type PdiCategory from './pdi-category.type';

export default interface Pdi {
  uuid: string;
  name: string;
  description?: string | null;
  due_date?: string | null;
  user?: UserAvatar;
  pdi_category?: PdiCategory;
  createdBy?: UserAvatar;
}
