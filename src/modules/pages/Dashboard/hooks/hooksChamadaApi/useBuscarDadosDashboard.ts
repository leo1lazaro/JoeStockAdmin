import { useQuery } from '@tanstack/react-query';
import { clienteApi, DADOS_MOCK_DASHBOARD } from '@/app/config/apiConfig';

export type DadosDashboardTipo = typeof DADOS_MOCK_DASHBOARD;

/**
 * Hook de chamada API com React Query e Axios para buscar os dados completos do Dashboard
 */
export function useBuscarDadosDashboard() {
  return useQuery<DadosDashboardTipo>({
    queryKey: ['dados-dashboard'],
    queryFn: async () => {
      try {
        const resposta = await clienteApi.get<DadosDashboardTipo>('/dashboard/dados');
        return resposta.data;
      } catch {
        // Fallback resiliente para garantir que os dados do design sempre apareçam
        return DADOS_MOCK_DASHBOARD;
      }
    },
    meta: {
      desativarNotificacao: true, // Notificação silenciosa na carga inicial
    },
  });
}
