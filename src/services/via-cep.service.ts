/**
 * Interface para tipar a resposta da API do ViaCEP.
 * @see https://viacep.com.br/ws/01001000/json/
 */
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export enum BrazilianStates {
  AC = 'AC', // Acre
  AL = 'AL', // Alagoas
  AP = 'AP', // Amapá
  AM = 'AM', // Amazonas
  BA = 'BA', // Bahia
  CE = 'CE', // Ceará
  DF = 'DF', // Distrito Federal
  ES = 'ES', // Espírito Santo
  GO = 'GO', // Goiás
  MA = 'MA', // Maranhão
  MT = 'MT', // Mato Grosso
  MS = 'MS', // Mato Grosso do Sul
  MG = 'MG', // Minas Gerais
  PA = 'PA', // Pará
  PB = 'PB', // Paraíba
  PR = 'PR', // Paraná
  PE = 'PE', // Pernambuco
  PI = 'PI', // Piauí
  RJ = 'RJ', // Rio de Janeiro
  RN = 'RN', // Rio Grande do Norte
  RS = 'RS', // Rio Grande do Sul
  RO = 'RO', // Rondônia
  RR = 'RR', // Roraima
  SC = 'SC', // Santa Catarina
  SP = 'SP', // São Paulo
  SE = 'SE', // Sergipe
  TO = 'TO', // Tocantins
}

/**
 * Service para interagir com a API do ViaCEP.
 */
class ViaCepService {
  private readonly VIA_CEP_API_BASE_URL = 'https://viacep.com.br/ws/';

  /**
   * Busca um endereço pelo CEP na API do ViaCEP.
   * @param cep O CEP a ser pesquisado (apenas dígitos).
   * @returns Uma Promise que resolve com os dados do endereço ou null se não encontrado/erro.
   */
  async getAddressByCep(cep: string): Promise<ViaCepResponse | null> {
    const cleanedCep = cep.replace(/\D/g, '');

    if (cleanedCep.length !== 8) {
      console.warn('CEP inválido para consulta ViaCEP: Deve conter 8 dígitos.');
      return null;
    }

    try {
      const response = await fetch(`${this.VIA_CEP_API_BASE_URL}${cleanedCep}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        console.warn(`CEP '${cleanedCep}' não encontrado ou inválido na ViaCEP.`);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Erro ao consultar ViaCEP para o CEP ${cleanedCep}:`, error);
      return null;
    }
  }
}

export const viaCepService = new ViaCepService();
