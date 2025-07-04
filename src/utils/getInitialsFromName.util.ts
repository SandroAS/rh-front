/**
 * Formata um nome completo, retornando as iniciais do primeiro e último nome.
 * Apenas considera nomes/sobrenomes com mais de 2 letras.
 *
 * @param fullName O nome completo da pessoa (ex: "Sandro Antonio Souza", "João da Silva").
 * @returns As iniciais do primeiro e último nome em maiúsculas (ex: "SS", "JS"),
 * ou uma string vazia se o nome for inválido.
 */
export function getInitials(fullName: string): string {
  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    return '';
  }

  const nameParts = fullName.trim().split(/\s+/);

  const meaningfulParts = nameParts.filter(part => part.length > 2);

  if (meaningfulParts.length === 0) {
    return '';
  }

  const firstNameInitial = meaningfulParts[0][0].toUpperCase();

  if (meaningfulParts.length === 1) {
    return firstNameInitial;
  }

  const lastNameInitial = meaningfulParts[meaningfulParts.length - 1][0].toUpperCase();

  return `${firstNameInitial}${lastNameInitial}`;
}