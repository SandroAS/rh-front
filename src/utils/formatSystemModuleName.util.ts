/**
 * Um mapa que associa as chaves de módulos do sistema do backend
 * com suas representações amigáveis para o usuário.
 *
 * Use este mapa para adicionar e gerenciar todas as suas traduções de módulos do sistema.
 */
const systemModuleMap: { [key: string]: string } = {
  'DENTISTRY': 'Odontologia',
  'PSYCHOLOGY': 'Psicologia',
  'NUTRITION': 'Nutricionista',
  'PHYSIOTHERAPY': 'Fisioterapia'
}

/**
 * Formata uma chave de módulos do sistema para uma string mais amigável para o usuário.
 * Se a módulo do sistema não for encontrada no mapa, tenta uma formatação genérica.
 *
 * @param systemModuleKey A chave da módulo do sistema (ex: 'DENTISTRY').
 * @returns A string formatada para exibição.
 */
export default function formatSystemModuleName(systemModuleKey: string): string {
  // Tenta encontrar a módulo do sistema no mapa
  if (systemModuleMap[systemModuleKey]) {
    return systemModuleMap[systemModuleKey];
  }

  const parts = systemModuleKey.replace(/_/g, ' ').split(' ');
  const formattedParts = parts.map(part => {
    // Capitaliza a primeira letra de cada palavra
    return part.charAt(0).toUpperCase() + part.slice(1);
  });

  return formattedParts.join(' ');
}
