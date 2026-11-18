import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { useNotificacoesStore } from '@/shared/states/useNotificacoesStore';

export interface MetaNotificacaoPersonalizada {
  desativarNotificacao?: boolean;
  mensagemSucesso?: string;
  mensagemErro?: string;
  titulo?: string;
}

// Extensão de tipos do React Query para suporte completo a meta de notificações
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: Error;
    mutationMeta: MetaNotificacaoPersonalizada;
    queryMeta: MetaNotificacaoPersonalizada;
  }
}

/**
 * Criação da instância do QueryClient com tratamento automático de notificações via Meta
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (erro, query) => {
      const meta = query.meta as MetaNotificacaoPersonalizada | undefined;
      if (meta?.desativarNotificacao) return;

      const mensagem = meta?.mensagemErro || (erro instanceof Error ? erro.message : 'Falha ao carregar dados');
      useNotificacoesStore.getState().adicionarNotificacao({
        tipo: 'erro',
        titulo: meta?.titulo || 'Erro de sincronização',
        mensagem,
      });
    },
    onSuccess: (_dados, query) => {
      const meta = query.meta as MetaNotificacaoPersonalizada | undefined;
      // Notificações em consultas (queries) só disparam se explicitamente configurada com mensagemSucesso
      if (meta?.mensagemSucesso && !meta?.desativarNotificacao) {
        useNotificacoesStore.getState().adicionarNotificacao({
          tipo: 'sucesso',
          titulo: meta?.titulo || 'Consulta atualizada',
          mensagem: meta.mensagemSucesso,
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (_dados, _variaveis, _contexto, mutation) => {
      const meta = mutation.meta as MetaNotificacaoPersonalizada | undefined;
      if (meta?.desativarNotificacao) return;

      const mensagem = meta?.mensagemSucesso || 'Operação realizada com sucesso!';
      useNotificacoesStore.getState().adicionarNotificacao({
        tipo: 'sucesso',
        titulo: meta?.titulo || 'Sucesso',
        mensagem,
      });
    },
    onError: (erro, _variaveis, _contexto, mutation) => {
      const meta = mutation.meta as MetaNotificacaoPersonalizada | undefined;
      if (meta?.desativarNotificacao) return;

      const mensagem = meta?.mensagemErro || (erro instanceof Error ? erro.message : 'Falha ao executar operação');
      useNotificacoesStore.getState().adicionarNotificacao({
        tipo: 'erro',
        titulo: meta?.titulo || 'Erro na operação',
        mensagem,
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de cache padrão
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
