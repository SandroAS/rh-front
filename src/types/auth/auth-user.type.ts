import type Company from '../company/company.type';
import type { UserAccount } from '../user/user-account.type';
import type { UserMeta } from '../user/user-meta.type';
import type { UserRole } from '../user/user-role.type';

export interface AuthUser {
  uuid: string;
  account?: UserAccount;
  name: string;
  email: string;
  cellphone?: string;
  cpf?: string;
  gender?: 'MALE' | 'FEMALE' | null;
  google_id?: string | null;
  profile_img_url?: string | null;
  is_active: boolean;
  role_id: number;
  password?: string;
  role: UserRole;
  userMetas: UserMeta[]
  companies?: Company[];
  created_at: string;
  updated_at: string;
}
