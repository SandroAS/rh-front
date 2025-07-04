import type { AuthResponse } from '@/types/auth/auth-response.type';
import type { AuthUser } from '@/types/auth/auth-user.type';
import { type AxiosResponse } from 'axios';
import api from './api.service';
import type { UserRegister } from '@/types/user/user-register.type';
import type { UserMeta } from '@/types/user/user-meta.type';

export const fetchWhoami = async (): Promise<AuthUser> => {
  try {
    const response: AxiosResponse<AuthUser> = await api.get('/auth/whoami');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário (whoami):', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signupUser = async (userRegister: UserRegister): Promise<AuthResponse> => {
  const response: AxiosResponse<AuthResponse> = await api.post('/auth/signup', userRegister);
  return response.data;
};

export const createTermsAcceptedInUserMetas = async (userUuid: string): Promise<UserMeta[]> => {
  const response: AxiosResponse<UserMeta[]> = await api.post('/auth/terms-accepted', { userUuid });
  return response.data;
};
