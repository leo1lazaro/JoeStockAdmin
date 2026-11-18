import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { clienteApi } from '@/app/config/apiConfig';

interface RespostaApi<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[] | null;
}

/**
 * Extrai uma mensagem amigável de erros da API (ApiResponse ou ProblemDetails).
 */
export function extrairMensagemErro(erro: unknown): string {
  if (isAxiosError(erro)) {
    const dados = erro.response?.data as
      | { message?: string; errors?: string[] | Record<string, string[]> | null; detail?: string }
      | undefined;

    if (Array.isArray(dados?.errors) && dados.errors.length > 0) {
      return dados.errors.join(' ');
    }

    if (dados?.errors && !Array.isArray(dados.errors)) {
      const mensagens = Object.values(dados.errors).flat();
      if (mensagens.length > 0) return mensagens.join(' ');
    }

    if (dados?.message) return dados.message;
    if (dados?.detail) return dados.detail;

    if (erro.response?.status === 401) return 'Sua sessão expirou. Entre novamente.';
    if (erro.response?.status === 403) return 'Você não tem permissão para realizar esta ação.';
    if (!erro.response) return 'Não foi possível se comunicar com a API.';
  }

  return 'Não foi possível concluir a operação.';
}

/**
 * Cria os hooks de listagem, gravação e exclusão de um cadastro administrativo de catálogo.
 */
export function criarHooksCatalogo<TItem extends { id: number }, TPayload>(recurso: string) {
  const chave = ['admin', 'catalogo', recurso] as const;
  const rota = `/admin/${recurso}`;

  function useListar() {
    return useQuery<TItem[]>({
      queryKey: chave,
      queryFn: async () => {
        const resposta = await clienteApi.get<RespostaApi<TItem[]>>(rota);
        return resposta.data.data;
      },
      meta: { desativarNotificacao: true },
    });
  }

  function useSalvar() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ id, payload }: { id?: number; payload: TPayload }) => {
        const resposta = id
          ? await clienteApi.put<RespostaApi<TItem>>(`${rota}/${id}`, payload)
          : await clienteApi.post<RespostaApi<TItem>>(rota, payload);
        return resposta.data;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
      meta: { desativarNotificacao: true },
    });
  }

  function useExcluir() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id: number) => {
        const resposta = await clienteApi.delete<RespostaApi<boolean>>(`${rota}/${id}`);
        return resposta.data;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
      meta: { desativarNotificacao: true },
    });
  }

  return { useListar, useSalvar, useExcluir };
}
