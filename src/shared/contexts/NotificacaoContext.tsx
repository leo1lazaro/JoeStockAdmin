import React, { createContext, useContext, useMemo } from 'react';
import { useNotificacoesStore, TipoNotificacao } from '@/shared/states/useNotificacoesStore';

interface ContextoNotificacaoTipo {
  notificar: (mensagem: string, tipo?: TipoNotificacao, titulo?: string, duracaoEmMs?: number) => void;
  notificarSucesso: (mensagem: string, titulo?: string) => void;
  notificarErro: (mensagem: string, titulo?: string) => void;
  notificarAviso: (mensagem: string, titulo?: string) => void;
  notificarInfo: (mensagem: string, titulo?: string) => void;
}

const NotificacaoContexto = createContext<ContextoNotificacaoTipo | undefined>(undefined);

export const ProvedorNotificacao: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adicionarNotificacao = useNotificacoesStore((s) => s.adicionarNotificacao);

  const valorContexto = useMemo<ContextoNotificacaoTipo>(() => ({
    notificar: (mensagem, tipo = 'info', titulo, duracaoEmMs) => {
      adicionarNotificacao({ mensagem, tipo, titulo, duracaoEmMs });
    },
    notificarSucesso: (mensagem, titulo = 'Sucesso') => {
      adicionarNotificacao({ mensagem, tipo: 'sucesso', titulo });
    },
    notificarErro: (mensagem, titulo = 'Erro') => {
      adicionarNotificacao({ mensagem, tipo: 'erro', titulo });
    },
    notificarAviso: (mensagem, titulo = 'Atenção') => {
      adicionarNotificacao({ mensagem, tipo: 'aviso', titulo });
    },
    notificarInfo: (mensagem, titulo = 'Informação') => {
      adicionarNotificacao({ mensagem, tipo: 'info', titulo });
    },
  }), [adicionarNotificacao]);

  return (
    <NotificacaoContexto.Provider value={valorContexto}>
      {children}
    </NotificacaoContexto.Provider>
  );
};

export function useNotificacao(): ContextoNotificacaoTipo {
  const contexto = useContext(NotificacaoContexto);
  if (!contexto) {
    throw new Error('useNotificacao deve ser utilizado dentro de ProvedorNotificacao');
  }
  return contexto;
}
