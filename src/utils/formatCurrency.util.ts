/**
 * Formats a number or a number-like string to Brazilian Real (BRL) currency string.
 *
 * @param value The value to be formatted. Can be a number or a string (e.g., "2000.00").
 * @returns The formatted currency string, e.g., "R$ 2.000,00".
 */
export default function formatToBRL(value: number | string | undefined): string {
  let numericValue: number;

  if (typeof value === 'string') {
    numericValue = parseFloat(value);
  } else if (typeof value === 'number') {
    numericValue = value;
  } else {
    console.error('Invalid value provided to formatToBRL. Expected a number or a string.');
    return '';
  }

  if (isNaN(numericValue)) {
    console.error('Failed to convert the provided value to a valid number.');
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}
