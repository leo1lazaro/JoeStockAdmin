import { clienteApi } from '@/app/config/apiConfig';
export interface RespostaEstoque<T> { success: boolean; message: string; data: T }
export interface PropriedadeEstoque { grupo: string; valor: string; valorId: number | null }
export interface LinhaEstoque {
  id: number; cartasId: number; cartasImpressaoId?: number | null;
  cartaNome: string; imagemUrl: string | null; tipo: number;
  propriedades: PropriedadeEstoque[]; quantidade: number;
}
export interface GrupoEstoque { cartasId: number; nome: string; imagemUrl: string | null; tipo: number; quantidadeTotal: number; combinacoes: LinhaEstoque[] }
export interface PaginaEstoque { itens: GrupoEstoque[]; total: number; pagina: number; tamanhoPagina: number; totalPaginas: number }
export interface AjusteEstoque { id: number; cartasId: number; nome: string; anterior: number; texto: string }
export type AjustesEstoque = Record<number, AjusteEstoque>;
export const tipoCarta = (tipo: number) => tipo === 1 ? 'Library' : tipo === 2 ? 'Cripta' : 'Comercial';
export const propriedade = (linha: LinhaEstoque, grupo: string) => linha.propriedades.find(p => p.grupo.toLowerCase() === grupo)?.valor;
export const quantidadeValida = (valor: string) => /^\d{1,5}$/.test(valor) && Number(valor) <= 99999;

export function alterarAjuste(ajustes: AjustesEstoque, linha: LinhaEstoque, texto: string): AjustesEstoque {
  const novos = { ...ajustes };
  const anterior = ajustes[linha.id]?.anterior ?? linha.quantidade;
  if (quantidadeValida(texto) && Number(texto) === anterior) delete novos[linha.id];
  else novos[linha.id] = { id: linha.id, cartasId: linha.cartasId, nome: linha.cartaNome, anterior, texto };
  return novos;
}
export function criarLote(ajustes: AjustesEstoque) {
  const itens = Object.values(ajustes);
  if (!itens.length || itens.length > 500 || itens.some(i => !quantidadeValida(i.texto))) throw new Error('Informe quantidades entre 0 e 99999 em até 500 combinações.');
  return { itens: itens.map(i => ({ id: i.id, quantidade: Number(i.texto), quantidadeAnterior: i.anterior })) };
}
export function dadosEstoque<T>(resposta: RespostaEstoque<T>) {
  if (!resposta.success) throw new Error(resposta.message || 'Não foi possível salvar o estoque.');
  return resposta.data;
}
export async function listarEstoque(termo: string, pagina: number, tamanhoPagina: number) {
  return dadosEstoque((await clienteApi.get<RespostaEstoque<PaginaEstoque>>('/admin/estoque/agrupado', { params: { termo, pagina, tamanhoPagina } })).data);
}
