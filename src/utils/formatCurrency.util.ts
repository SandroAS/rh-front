/**
 * Formats a number or a number-like string to Brazilian Real (BRL) currency string.
 *
 * @param value The value to be formatted. Can be a number or a string (e.g., "2000.00").
 * @returns The formatted currency string, e.g., "R$ 2.000,00".
 */
export default function formatToBRL(value: number | string): string {
  let numericValue: number;

  // Verifica o tipo do valor de entrada
  if (typeof value === 'string') {
    // Tenta converter a string para um número
    numericValue = parseFloat(value);
  } else if (typeof value === 'number') {
    numericValue = value;
  } else {
    // Lida com tipos de entrada inválidos
    console.error('Invalid value provided to formatToBRL. Expected a number or a string.');
    return ''; // Ou retorne um valor padrão, como "R$ 0,00"
  }

  // Verifica se a conversão resultou em um número válido
  if (isNaN(numericValue)) {
    console.error('Failed to convert the provided value to a valid number.');
    return '';
  }

  // Use a API Intl.NumberFormat para formatação
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}
