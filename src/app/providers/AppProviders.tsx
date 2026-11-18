import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/app/config/reactQueryConfig';
import { ProvedorNotificacao } from '@/shared/contexts/NotificacaoContext';

interface PropriedadesAppProviders {
  children: React.ReactNode;
}

/**
 * Provider raiz com QueryClientProvider e Contexto de Notificações
 */
export const AppProviders: React.FC<PropriedadesAppProviders> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvedorNotificacao>
        {children}
      </ProvedorNotificacao>
    </QueryClientProvider>
  );
};
