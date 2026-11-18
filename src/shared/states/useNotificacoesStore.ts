import { create } from 'zustand';

export type TipoNotificacao = 'sucesso' | 'erro' | 'info' | 'aviso';

export interface ItemNotificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo?: string;
  mensagem: string;
  duracaoEmMs?: number;
}

interface EstadoNotificacoes {
  notificacoes: ItemNotificacao[];
  adicionarNotificacao: (notificacao: Omit<ItemNotificacao, 'id'>) => string;
  removerNotificacao: (id: string) => void;
  limparTodas: () => void;
}

export const useNotificacoesStore = create<EstadoNotificacoes>((set) => ({
  notificacoes: [],

  adicionarNotificacao: (notificacao) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const novaNotificacao: ItemNotificacao = {
      ...notificacao,
      id,
      duracaoEmMs: notificacao.duracaoEmMs ?? 4000,
    };

    set((estado) => ({
      notificacoes: [...estado.notificacoes, novaNotificacao],
    }));

    // Auto-remover após tempo estipulado
    if (novaNotificacao.duracaoEmMs && novaNotificacao.duracaoEmMs > 0) {
      setTimeout(() => {
        set((estado) => ({
          notificacoes: estado.notificacoes.filter((n) => n.id !== id),
        }));
      }, novaNotificacao.duracaoEmMs);
    }

    return id;
  },

  removerNotificacao: (id: string) => {
    set((estado) => ({
      notificacoes: estado.notificacoes.filter((n) => n.id !== id),
    }));
  },

  limparTodas: () => {
    set({ notificacoes: [] });
  },
}));
