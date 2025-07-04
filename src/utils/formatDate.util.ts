import dayjs from '@/plugins/dayjs'

/**
 * Formata uma string de data ISO 8601 (ex: "2025-06-15T22:32:51.000Z")
 * para o formato "DD/MM/YYYY".
 *
 * @param isoDateString A string de data no formato ISO 8601.
 * @returns A data formatada como "DD/MM/YYYY" ou uma string vazia se a entrada for inválida.
 */
export function formatDate(isoDateString: string | Date | null | undefined): string {
  if (!isoDateString) {
    return '';
  }

  const date = dayjs.utc(isoDateString);

  if (!date.isValid()) {
    return 'Data inválida';
  }

  return date.format('DD/MM/YYYY');
}
