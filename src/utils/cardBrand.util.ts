/**
 * Detecção de bandeira de cartão por BIN (primeiros dígitos).
 * Formatação de número e validade para exibição no cartão visual.
 */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | null;

const VISA_PREFIX = ['4'];
const MASTERCARD_PREFIXES = ['51', '52', '53', '54', '55'];
const MASTERCARD_RANGE_2 = ['2221', '2720']; // 2221-2720
const AMEX_PREFIXES = ['34', '37'];
const ELO_PREFIXES = [
  '4011', '4312', '438935', '451416', '457393', '504175', '506699', '5067', '5090',
  '5091', '5092', '5094', '5095', '5096', '5097', '5098', '5099',
  '627780', '636297', '636368', '650031', '650032', '650033', '650035', '650051',
  '650405', '650439', '650485', '650538', '650539', '650541', '650598', '650599',
  '650718', '650720', '650727', '650901', '650920', '651652', '651679',
  '655000', '655019', '655058',
];
const HIPERCARD_PREFIXES = ['38', '60'];

function onlyDigits(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

function matchesPrefix(digits: string, prefix: string): boolean {
  return digits === prefix || digits.startsWith(prefix);
}

function inRange(digits: string, min: string, max: string): boolean {
  if (digits.length < min.length) return false;
  const n = digits.slice(0, min.length);
  return n >= min && n <= max;
}

/**
 * Detecta a bandeira do cartão a partir do número (apenas dígitos).
 */
export function getCardBrand(cardNumber: string): CardBrand {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 2) return null;

  if (VISA_PREFIX.some((p) => matchesPrefix(digits, p))) return 'visa';
  if (AMEX_PREFIXES.some((p) => matchesPrefix(digits, p))) return 'amex';
  if (MASTERCARD_PREFIXES.some((p) => matchesPrefix(digits, p))) return 'mastercard';
  if (digits.length >= 4 && inRange(digits, MASTERCARD_RANGE_2[0], MASTERCARD_RANGE_2[1])) return 'mastercard';
  if (HIPERCARD_PREFIXES.some((p) => matchesPrefix(digits, p))) return 'hipercard';
  if (ELO_PREFIXES.some((p) => matchesPrefix(digits, p))) return 'elo';
  // 50xxx (não coberto por Elo específico) pode ser Mastercard 2-series ou Elo
  if (digits.startsWith('50') && digits.length >= 4) return 'elo';

  return null;
}

/**
 * Formata o número do cartão para exibição (grupos separados por espaço).
 * Visa/Mastercard/Elo: 4-4-4-4; Amex: 4-6-5.
 */
export function formatCardNumberDisplay(cardNumber: string): string {
  const d = onlyDigits(cardNumber);
  const brand = getCardBrand(d);

  if (brand === 'amex') {
    if (d.length <= 4) return d;
    if (d.length <= 10) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 10)} ${d.slice(10, 15)}`;
  }

  return d.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Máscara de input: retorna o padrão para vue-the-mask conforme a bandeira.
 */
export function getCardNumberMask(cardNumber: string): string | string[] {
  const brand = getCardBrand(onlyDigits(cardNumber));
  if (brand === 'amex') return '#### ###### #####';
  return '#### #### #### ####';
}

/**
 * Formata validade para exibição (MM/YY).
 */
export function formatExpiryDisplay(value: string): string {
  const d = onlyDigits(value);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}`;
}
