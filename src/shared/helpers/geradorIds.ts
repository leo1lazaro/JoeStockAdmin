/**
 * Gerador de identificadores únicos para itens e transações
 */

export function gerarIdUnico(prefixo = 'id'): string {
  return `${prefixo}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}
