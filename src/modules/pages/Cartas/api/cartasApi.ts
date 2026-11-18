import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '@/app/config/apiConfig';

interface RespostaApi<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FiltroOpcao {
  id: number;
  nome: string;
  sigla?: string | null;
  imagemUrl?: string | null;
}

export interface CartaItem {
  id: number;
  tipo: number | string;
  nome: string;
  nomeImpresso: string;
  textoCarta: string;
  imagemUrl?: string | null;
}

export interface CartasListagem {
  cartas: CartaItem[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  filtros: {
    tipos: FiltroOpcao[];
    tiposCarta: FiltroOpcao[];
    clas: FiltroOpcao[];
    disciplinas: FiltroOpcao[];
    idiomas: FiltroOpcao[];
    estados: FiltroOpcao[];
    grupos: number[];
  };
}

export interface FiltrosCartas {
  termo: string;
  tipo: number;
  tipoCartaId: number;
  clasId: number;
  disciplinaId: number;
  idiomaId: number;
  estadoId: number;
  grupo: number;
  pagina: number;
  tamanhoPagina: number;
}

export const FILTROS_CARTAS_INICIAIS: FiltrosCartas = {
  termo: '',
  tipo: 0,
  tipoCartaId: 0,
  clasId: 0,
  disciplinaId: 0,
  idiomaId: 0,
  estadoId: 0,
  grupo: 0,
  pagina: 1,
  tamanhoPagina: 20,
};

function montarParametros(filtros: FiltrosCartas) {
  const parametros = new URLSearchParams();
  if (filtros.termo.trim()) parametros.set('Termo', filtros.termo.trim());
  if (filtros.tipo) parametros.set('Tipo', String(filtros.tipo));
  if (filtros.tipoCartaId) parametros.append('TiposCartaIds', String(filtros.tipoCartaId));
  if (filtros.clasId) parametros.append('ClasIds', String(filtros.clasId));
  if (filtros.disciplinaId) parametros.append('DisciplinasIds', String(filtros.disciplinaId));
  if (filtros.idiomaId) parametros.append('IdiomasIds', String(filtros.idiomaId));
  if (filtros.estadoId) parametros.append('EstadosIds', String(filtros.estadoId));
  if (filtros.grupo) parametros.append('Grupos', String(filtros.grupo));
  parametros.set('Pagina', String(filtros.pagina));
  parametros.set('TamanhoPagina', String(filtros.tamanhoPagina));
  return parametros.toString();
}

export interface CartaPayload {
  tipo: number;
  nome: string;
  nomeImpresso?: string | null;
  textoCarta: string;
  imagemUrl?: string | null;
  tiposCartaIds: number[];
  clasIds: number[];
  disciplinasIds: number[];
  idiomasIds: number[];
  estadosIds: number[];
  capacidade?: number | null;
  edicao?: string | null;
  grupo?: number | null;
  custoSangue?: number | null;
  custoPool?: number | null;
  acaoDirecionada: boolean;
  textoRequisito?: string | null;
}

export function useCriarCarta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CartaPayload) => {
      const resposta = await clienteApi.post<RespostaApi<CartaItem>>('/admin/cartas', payload);
      return resposta.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cartas'] }),
    meta: { desativarNotificacao: true },
  });
}

export interface CartaDetalhe extends Omit<CartaPayload, 'tipo'> {
  id: number;
  tipo: number;
}

export function useObterCarta(id?: number) {
  return useQuery<CartaDetalhe>({
    queryKey: ['admin', 'carta', id],
    enabled: !!id,
    queryFn: async () => {
      const resposta = await clienteApi.get<RespostaApi<CartaDetalhe>>(`/admin/cartas/${id}`);
      return resposta.data.data;
    },
    staleTime: 0,
    gcTime: 0,
    meta: { desativarNotificacao: true },
  });
}

export function useAtualizarCarta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CartaPayload }) => {
      const resposta = await clienteApi.put<RespostaApi<CartaItem>>(`/admin/cartas/${id}`, payload);
      return resposta.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cartas'] }),
    meta: { desativarNotificacao: true },
  });
}

export function useListarCartas(filtros: FiltrosCartas) {
  return useQuery<CartasListagem>({
    queryKey: ['admin', 'cartas', filtros],
    queryFn: async () => {
      const resposta = await clienteApi.get<RespostaApi<CartasListagem>>(`/cartas?${montarParametros(filtros)}`);
      return resposta.data.data;
    },
    placeholderData: keepPreviousData,
    meta: { desativarNotificacao: true },
  });
}
