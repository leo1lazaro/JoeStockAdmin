import { useMutation } from '@tanstack/react-query';
import { clienteApi } from '@/app/config/apiConfig';

export interface ParametrosTransferencia {
  destinatario: string;
  valor: number;
  cartaoOrigemId: string;
  descricao?: string;
}

/**
 * Hook de mutação para envio de transferências bancárias
 */
export function useRealizarTransferenciaApi() {
  return useMutation({
    mutationFn: async (dados: ParametrosTransferencia) => {
      const resposta = await clienteApi.post('/transferir', dados);
      return resposta.data;
    },
    meta: {
      desativarNotificacao: false,
      mensagemSucesso: 'Transferência enviada com sucesso para o destinatário!',
      titulo: 'Transferência Realizada',
    },
  });
}
