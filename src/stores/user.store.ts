import { defineStore } from 'pinia';
import { createTermsAcceptedInUserMetas, fetchWhoami, loginUser, signupUser } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth/auth-user.type';
import type { AuthResponse } from '@/types/auth/auth-response.type';
import router from '@/router';
import type { UserRegister } from '@/types/user/user-register.type';
import type { UserMeta } from '@/types/user/user-meta.type';
import type { ProfilePersonalInformation } from '@/types/profile/profile-personal-information.type';
import { saveUserCompany, saveUserPassword, updateUserPersonalInformation } from '@/services/profile.service';
import type { ProfileCompany } from '@/types/profile/profile-company.type';
import type ProfileCompanyResponse from '@/types/profile/profile-company-response.type';
import type ProfilePassword from '@/types/profile/profile-password.type';
import type User from '@/types/user/user.type';

interface UserStoreState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserStoreState => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state): boolean => !!state.user,
    userName: (state): string => state.user?.name || 'Visitante',
    userEmail: (state): string | undefined => state.user?.email,
    userProfileImageUrl: (state): string | null | undefined => state.user?.profile_img_url,
    userPermissions: (state): string[] => state.user?.role?.permissions || [],
    currentUser: (state): AuthUser | null => state.user,
    currentUserSample: (state): User => ({
      name: state.user?.name || '',
      email: state.user!.email || '',
      cellphone: state.user?.cellphone || '',
      profile_img_url: state.user?.profile_img_url || ''
    })
  },

  actions: {
    async fetchUser(): Promise<AuthUser | null> {
      this.loading = true;
      this.error = null;
      try {
        if(!localStorage.getItem('access_token')) return null;
        const userData: AuthUser = await fetchWhoami();
        localStorage.setItem('user', JSON.stringify(userData));
        this.user = userData;
        return userData;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Falha ao carregar dados do usuário.';
        console.error('Erro na ação fetchUser:', err);
        this.logout();
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async handleAuthSuccess(accessToken: string, userData?: AuthUser | null) {
      localStorage.setItem('access_token', accessToken);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        this.user = userData;
      } else {
        await this.fetchUser();
      }
    },

    logout() {
      this.user = null;
      this.loading = false;
      this.error = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      router.push('/auth/login');
    },

    async login(email: string, password: string): Promise<AuthUser | null> {
      this.loading = true;
      this.error = null;
      try {
        const response: AuthResponse = await loginUser(email, password);
        await this.handleAuthSuccess(response.accessToken, response.user);
        return this.user;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao realizar login.';
        this.user = null;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async signup(userRegister: UserRegister): Promise<AuthUser | null> {
      this.loading = true;
      this.error = null;
      try {
        const response: AuthResponse = await signupUser(userRegister);
        await this.handleAuthSuccess(response.accessToken, response.user);
        return this.user;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao realizar cadastro.';
        this.user = null;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async termsAcceptedAfterGoogleAuthCallback(userUuid: string) {
      this.loading = true;
      this.error = null;
      try {
        const response: UserMeta[] = await createTermsAcceptedInUserMetas(userUuid);
        if(this.user) {
          this.user.userMetas = response;
        }
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao realizar cadastro.';
        this.user = null;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateUserPersonalInformation(formData: FormData, personalInformation: ProfilePersonalInformation) {
      this.loading = true;
      this.error = null;
      try {
        const response = await updateUserPersonalInformation(this.user!.uuid, formData);
        this.user!.name = personalInformation.name;
        this.user!.email = personalInformation.email;
        this.user!.cellphone = personalInformation.cellphone;
        this.user!.cpf = personalInformation.cpf;
        if(response.profile_img_url) this.user!.profile_img_url = response.profile_img_url;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar usuário.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async saveUserCompany(company: ProfileCompany) {
      this.loading = true;
      this.error = null;
      const uuid = this.user!.companies?.length ? this.user!.companies[0].uuid : undefined;

      try {
        const response: ProfileCompanyResponse = await saveUserCompany(company, uuid);
        this.user!.companies = [];
        this.user!.companies[0] = {
          uuid: uuid || response.uuid,
          ...company,
          address: {
            uuid: response.address?.uuid || company.address.uuid,
            ...company.address
          }
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar empresa.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async savePassword(password: ProfilePassword) {
      this.loading = true;
      this.error = null;

      try {
        await saveUserPassword(this.user!.uuid, password);
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar senha.';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  },
});
