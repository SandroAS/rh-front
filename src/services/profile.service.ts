import type { AxiosResponse } from 'axios';
import api from './api.service';
import type { ProfilePersonalInformationResponse } from '@/types/profile/profile-personal-information-response.type';
import type ProfileCompanyResponse from '@/types/profile/profile-company-response.type';
import type { ProfileCompany } from '@/types/profile/profile-company.type';
import type ProfilePassword from '@/types/profile/profile-password.type';

export const updateUserPersonalInformation = async (uuid: string, personalInformation: FormData): Promise<ProfilePersonalInformationResponse> => {
  const response: AxiosResponse<ProfilePersonalInformationResponse> = await api.put(`/users/personal-information/${uuid}`, personalInformation, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  return response.data;
};

export const saveUserCompany = async (company: ProfileCompany, uuid?: string) => {
  const response: AxiosResponse<ProfileCompanyResponse> = uuid 
    ? await api.put(`/company/${uuid}`, company)
    : await api.post('/company', company);
  return response.data;
};

export const saveUserPassword = async (uuid: string, password: ProfilePassword) => {
  const response: AxiosResponse<boolean> = await api.put(`/users/password/${uuid}`, password);
  return response.data;
};
