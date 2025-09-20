import { ref, watch, type Ref } from 'vue';

/**
 * Converte um valor numérico para o formato de moeda brasileira (BRL).
 * @param value O valor numérico.
 * @returns A string formatada, ex: "1.000,00".
 */
export const formatToBRL = (value: number | null | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0,00';
  }
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
};

/**
 * Remove a formatação de moeda de uma string e a converte para um número.
 * @param value A string formatada, ex: "R$ 1.000,00".
 * @returns O valor numérico, ex: 1000.
 */
export const unformatFromBRL = (value: string | null | undefined): number => {
  if (typeof value !== 'string') return 0;
  const cleanedValue = value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(cleanedValue) || 0;
};

/**
 * Composable que encapsula a lógica de um campo de input de moeda formatado.
 * @param initialValue A referência reativa do valor numérico (e.g., ref(0)).
 * @returns Um objeto com propriedades para o v-model e a lógica de atualização.
 */
export const useCurrencyField = (initialValue: Ref<number | undefined>) => {
  // Estado interno para a string formatada no input
  const formattedValue = ref<string>(formatToBRL(initialValue.value));

  // Observa a mudança no valor numérico para atualizar o campo formatado
  watch(initialValue, (newValue) => {
    formattedValue.value = formatToBRL(newValue);
  });

  // Handler para atualizar o valor numérico quando o input formatado muda
  const onInput = (value: string | undefined) => {
    const unformatted = unformatFromBRL(value);
    initialValue.value = unformatted;
  };

  return {
    formattedValue,
    onInput,
  };
};

export function formatCurrencyDisplay(value: number | string | undefined): string {  
  let numericValue: number;

  if (typeof value === 'string') {
    numericValue = parseFloat(value);
  } else if (typeof value === 'number') {
    numericValue = value;
  } else {
    return '0,00';
  }

  if (isNaN(numericValue)) {
    return '0,00';
  }

  const valueInCents = Math.round(numericValue * 100);

  return (valueInCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
}

/**
 * objWithValue deve ser passado como objeto para conseguir 
 * setar a variável de referência diretamente sem precisar 
 * retornar e atribuir fora da função
 * 
 * @param objWithValue 
 * @param event 
 * @param onChange 
 * @returns 
 */
export function getCurrencyNumber(event: KeyboardEvent, value: number | string | undefined): number {
  const key = event.key;

  if (!/^\d$/.test(key) && key !== 'Backspace') {
    event.preventDefault();
    return 0;
  }

  let valueInCents = value || 0;
  if (typeof valueInCents === 'string') {
    valueInCents = parseInt(valueInCents.replace(/\D/g, '') || '0');
  } else if (typeof valueInCents === 'number') {
    valueInCents = Math.round(valueInCents * 100);
  }

  if (key === 'Backspace') {
    valueInCents = Math.floor(valueInCents / 10);
  } else {
    valueInCents = valueInCents * 10 + parseInt(key);
  }

  return valueInCents / 100;
}