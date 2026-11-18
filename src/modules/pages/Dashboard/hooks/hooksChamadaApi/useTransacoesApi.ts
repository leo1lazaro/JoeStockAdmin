import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '@/app/config/apiConfig';

export interface ItemTransacao {
  id: string;
  empresa: string;
  categoria: string;
  data: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  tipoLabel: string;
  icone: string;
}

export interface DadosNovaTransacao {
  empresa: string;
  categoria: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  tipoLabel?: string;
  icone?: string;
}

/**
 * Hook para listar transações recentes
 */
export function useListarTransacoes() {
  return useQuery<ItemTransacao[]>({
    queryKey: ['transacoes-recentes'],
    queryFn: async () => {
      const resposta = await clienteApi.get<ItemTransacao[]>('/transacoes');
      return resposta.data;
    },
    meta: {
      desativarNotificacao: true,
    },
  });
}

/**
 * Hook para criar uma nova transação com notificação automática via meta
 */
export function useCriarTransacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (novaTransacao: DadosNovaTransacao) => {
      const payload: Omit<ItemTransacao, 'id'> = {
        ...novaTransacao,
        data: 'Nov 12, 26',
        tipoLabel: novaTransacao.tipo === 'receita' ? 'Income' : 'Transfer',
        icone: novaTransacao.icone || 'shopping',
      };
      const resposta = await clienteApi.post<ItemTransacao>('/transacoes', payload);
      return resposta.data;
    },
    meta: {
      desativarNotificacao: false, // Ativa a notificação automática configurada no React Query
      mensagemSucesso: 'Nova transação registrada com sucesso!',
      titulo: 'Transação Concluída',
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes-recentes'] });
      queryClient.invalidateQueries({ queryKey: ['dados-dashboard'] });
    },
  });
}
