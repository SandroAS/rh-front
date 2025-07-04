import { Form, Field, ErrorMessage, configure, defineRule } from 'vee-validate'
import { localize } from '@vee-validate/i18n'
import pt_BR from '@vee-validate/i18n/dist/locale/pt_BR.json'
import {
  required,
  email,
  min,
  max,
  min_value,
  alpha_spaces,
  one_of,
  confirmed,
  integer,
  mimes,
  image,
  length,
  numeric
} from '@vee-validate/rules'

defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('max', max)
defineRule('min_value', min_value)
defineRule('alpha_spaces', alpha_spaces)
defineRule('one_of', one_of)
defineRule('confirmed', confirmed)
defineRule('integer', integer)
defineRule('mimes', mimes)
defineRule('image', image)
defineRule('length', length)
defineRule('numeric', numeric)

defineRule('cpf', (value: string | number) => {
  if (!value) {
    return 'O campo CPF é obrigatório.';
  }

  const cleanedCpf = String(value).replace(/[^\d]/g, '');

  if (cleanedCpf.length !== 11) {
    return 'O CPF deve conter 11 dígitos.';
  }

  // Verifica CPFs sequenciais (comumente usados para fraude)
  if (cleanedCpf === "00000000000" ||
      cleanedCpf === "11111111111" ||
      cleanedCpf === "22222222222" ||
      cleanedCpf === "33333333333" ||
      cleanedCpf === "44444444444" ||
      cleanedCpf === "55555555555" ||
      cleanedCpf === "66666666666" ||
      cleanedCpf === "77777777777" ||
      cleanedCpf === "88888888888" ||
      cleanedCpf === "99999999999") {
    return 'CPF inválido.';
  }

  let sum = 0;
  let remainder;

  // Validação do primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanedCpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;

  if ((remainder == 10) || (remainder == 11)) {
    remainder = 0;
  }
  if (remainder != parseInt(cleanedCpf.substring(9, 10))) {
    return 'CPF inválido.';
  }

  sum = 0;
  // Validação do segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanedCpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;

  if ((remainder == 10) || (remainder == 11)) {
    remainder = 0;
  }
  if (remainder != parseInt(cleanedCpf.substring(10, 11))) {
    return 'CPF inválido.';
  }

  return true;
})

defineRule('is_true', (value: boolean) => {
  if (value !== true) {
    return 'Você deve aceitar os termos para prosseguir.';
  }
  return true;
})

defineRule('cnpj', (value: string | number) => {
  if (!value) {
    return true;
  }

  const cleanedCnpj = String(value).replace(/[^\d]/g, '');

  if (cleanedCnpj.length !== 14) {
    return 'O CNPJ deve conter 14 dígitos.';
  }

  if (/^(\d)\1{13}$/.test(cleanedCnpj)) {
    return 'CNPJ inválido.';
  }

  const cnpjNumbers = cleanedCnpj.split('').map(Number);

  // Pesos para o cálculo do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  // Calcula a soma ponderada para o primeiro dígito
  for (let i = 0; i < 12; i++) {
    sum += cnpjNumbers[i] * weights1[i];
  }

  // Calcula o primeiro dígito verificador
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;

  // Compara com o primeiro dígito real do CNPJ
  if (cnpjNumbers[12] !== digit1) {
    return 'CNPJ inválido.';
  }

  // Pesos para o cálculo do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;

  // Calcula a soma ponderada para o segundo dígito
  for (let i = 0; i < 13; i++) {
    sum += cnpjNumbers[i] * weights2[i];
  }

  // Calcula o segundo dígito verificador
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;

  // Compara com o segundo dígito real do CNPJ
  if (cnpjNumbers[13] !== digit2) {
    return 'CNPJ inválido.';
  }

  return true;
});

localize({ pt_BR })
configure({
  generateMessage: localize('pt_BR')
})

export {
  Form,
  Field,
  ErrorMessage
}
