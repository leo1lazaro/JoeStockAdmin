import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '@/app/config/apiConfig';
export interface Produto {
  versao?: string;
  id: number; nome: string; descricao: string; imagem: string;
  categoria: string; origem: string; subcategoria: string;
  preco: number; estoque: number; ativo: boolean; cartaId: number | null;
}
export interface Pedido {
  id: number; protocolo: string; nome: string; email: string; telefone: string; observacoes: string;
  status: 'aguardando' | 'confirmado' | 'concluido' | 'cancelado'; criadoEm: string; total: number;
  itens: { id: number; produtoId: number; nome: string; quantidade: number; precoUnitario: number }[];
}
interface Resposta<T> { success: boolean; message: string; data: T }
export const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const statusPedido = { aguardando: 'Aguardando confirmação', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado' };
export function useProdutos() {
  return useQuery({ queryKey: ['admin', 'produtos'], queryFn: async () => (await clienteApi.get<Resposta<Produto[]>>('/admin/produtos')).data.data });
}
export function usePedidos() {
  return useQuery({ queryKey: ['admin', 'pedidos'], queryFn: async () => (await clienteApi.get<Resposta<Pedido[]>>('/admin/pedidos')).data.data });
}
export function useSalvarProduto() {
  const cache = useQueryClient();
  return useMutation({ mutationFn: async ({ id, ...dados }: Produto) => {
    const resposta = id ? await clienteApi.put<Resposta<Produto>>(`/admin/produtos/${id}`, dados) : await clienteApi.post<Resposta<Produto>>('/admin/produtos', dados);
    return resposta.data.data;
  }, onSuccess: () => cache.invalidateQueries({ queryKey: ['admin', 'produtos'] }) });
}
export function useAlterarPedido() {
  const cache = useQueryClient();
  return useMutation({ mutationFn: async ({ id, status }: { id: number; status: string }) =>
    (await clienteApi.put<Resposta<Pedido>>(`/admin/pedidos/${id}/status`, { status })).data.data,
    onSuccess: async () => { await Promise.all([cache.invalidateQueries({ queryKey: ['admin', 'pedidos'] }), cache.invalidateQueries({ queryKey: ['admin', 'produtos'] })]); } });
}
