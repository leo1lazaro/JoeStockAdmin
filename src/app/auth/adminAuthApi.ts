import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { clienteApi } from '@/app/config/apiConfig';

export interface AdminSessao {
  id: string;
  nome: string;
  email: string | null;
}

export interface CredenciaisAdmin {
  cpf: string;
  senha: string;
}

export class AdminCookieSessionError extends Error {
  constructor() {
    super('A API aceitou as credenciais, mas não confirmou a sessão pelo cookie de autenticação.');
    this.name = 'AdminCookieSessionError';
  }
}

export const CHAVE_SESSAO_ADMIN = ['admin', 'sessao'] as const;

export function useSessaoAdmin() {
  return useQuery<AdminSessao>({
    queryKey: CHAVE_SESSAO_ADMIN,
    queryFn: async () => {
      const resposta = await clienteApi.get<AdminSessao>('/admin/auth/session');
      return resposta.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    retry: false,
    meta: {
      desativarNotificacao: true,
    },
  });
}

export function useLoginAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credenciais: CredenciaisAdmin) => {
      await clienteApi.post<AdminSessao>('/admin/auth/login', credenciais);

      try {
        const respostaSessao = await clienteApi.get<AdminSessao>('/admin/auth/session');
        return respostaSessao.data;
      } catch (erro) {
        if (isAxiosError(erro) && (erro.response?.status === 401 || erro.response?.status === 403)) {
          throw new AdminCookieSessionError();
        }

        throw erro;
      }
    },
    onSuccess: (sessao) => {
      queryClient.setQueryData(CHAVE_SESSAO_ADMIN, sessao);
    },
    meta: {
      desativarNotificacao: true,
    },
  });
}

export function useLogoutAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await clienteApi.post('/admin/auth/logout');
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: CHAVE_SESSAO_ADMIN });
    },
    meta: {
      desativarNotificacao: true,
    },
  });
}
