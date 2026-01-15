import type { Role } from '../role/role.type';
import type JobPosition from '../jobPosition/job-position.type';

export default interface AccountUser {
  uuid?: string;
  name: string;
  email: string;
  cellphone?: string;
  cpf?: string;
  is_active: boolean;
  profile_img_url?: string;
  password?: string | null;
  role: Role;
  jobPosition?: JobPosition;
}
