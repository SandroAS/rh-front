import type { AuthUser } from './auth-user.type';

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}