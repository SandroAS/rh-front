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