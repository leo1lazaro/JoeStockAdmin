import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '@/app/config/apiConfig';
export interface CartaLoja {
  id: number; nome: string; nomeImpresso: string; textoCarta: string; imagemUrl: string | null;
  categoria: string; origem: string; subcategoria: string;
  preco: number; estoque: number; ativo: boolean;
}
export interface Pedido {
  id: number; protocolo: string; nome: string; email: string; telefone: string; observacoes: string;
  status: 'aguardando' | 'confirmado' | 'concluido' | 'cancelado'; criadoEm: string; total: number;
  itens: { id: number; cartaId: number; nome: string; quantidade: number; precoUnitario: number }[];
}
interface Resposta<T> { success: boolean; message: string; data: T }
export const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const statusPedido = { aguardando: 'Aguardando confirmação', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado' };
export function useCartasDaLoja() {
  return useQuery({ queryKey: ['admin', 'cartas-loja'], queryFn: async () => (await clienteApi.get<Resposta<CartaLoja[]>>('/cartas/loja')).data.data });
}
export function usePedidos() {
  return useQuery({ queryKey: ['admin', 'pedidos'], queryFn: async () => (await clienteApi.get<Resposta<Pedido[]>>('/admin/pedidos')).data.data });
}
export function useAlterarPedido() {
  const cache = useQueryClient();
  return useMutation({ mutationFn: async ({ id, status }: { id: number; status: string }) =>
    (await clienteApi.put<Resposta<Pedido>>(`/admin/pedidos/${id}/status`, { status })).data.data,
    onSuccess: async () => { await Promise.all([cache.invalidateQueries({ queryKey: ['admin', 'pedidos'] }), cache.invalidateQueries({ queryKey: ['admin', 'cartas-loja'] }), cache.invalidateQueries({ queryKey: ['admin', 'cartas'] })]); } });
}
