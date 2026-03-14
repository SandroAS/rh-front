/**
 * Formato de erro esperado do backend (NestJS/axios):
 * { message: string, error?: string, statusCode?: number }
 */

/**
 * Extrai a mensagem de erro da resposta da API.
 * @param err - Erro capturado (AxiosError ou similar)
 * @param fallback - Mensagem usada quando não houver message em response.data
 * @returns Mensagem para exibir ao usuário
 */
export function getApiErrorMessage(err: unknown, fallback: string = 'Ocorreu um erro.'): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message?.trim() ? message : fallback;
}
