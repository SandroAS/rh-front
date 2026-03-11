export interface UserRegister {
  name: string;
  email: string;
  cellphone: string;
  cpf: string;
  moduleTypes: string[];
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}
