import type Address from '../address/address.type';

export interface ProfileCompany {
  uuid?: string;
  name: string;
  social_reason: string;
  cnpj: string;
  email: string;
  cellphone: string;
  address: Address
}
