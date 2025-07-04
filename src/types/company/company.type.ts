import type Address from '../address/address.type';

export default interface Company {
  uuid?: string;
  name?: string;
  social_reason?: string;
  cnpj?: string;
  email?: string;
  cellphone?: string;
  address?: Address;
}
