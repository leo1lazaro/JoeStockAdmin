/**
 * Formatadores utilitários para valores monetários, datas e porcentagens
 */

export function formatarMoeda(valor: number, moeda = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

export function formatarPorcentagem(valor: number, incluirSinal = true): string {
  const sinal = incluirSinal && valor > 0 ? '+' : '';
  return `${sinal}${valor.toFixed(1)}%`;
}

export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('en-US').format(valor);
}

export function formatarDataExtensa(data: Date = new Date()): string {
  const opcoes: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat('en-US', opcoes).format(data);
}
