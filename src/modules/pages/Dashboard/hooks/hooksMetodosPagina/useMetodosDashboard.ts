import { usePainelStore, PeriodoFiltro } from '@/shared/states/usePainelStore';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';

export function useMetodosDashboard() {
  const {
    periodoSelecionado,
    definirPeriodo,
    termoBusca,
    definirTermoBusca,
    sidebarAberta,
    alternarSidebar,
    menuAtivo,
    definirMenuAtivo,
  } = usePainelStore();

  const toast = useNotificacaoToast();

  const aoMudarPeriodo = (novoPeriodo: PeriodoFiltro) => {
    definirPeriodo(novoPeriodo);
    const rotulos = {
      este_mes: 'Este Mês (Julho)',
      mes_anterior: 'Mês Anterior (Junho)',
      ano: 'Visão Anual (2026)',
    };
    toast.info(`Período alterado para: ${rotulos[novoPeriodo] || novoPeriodo}`);
  };

  const aoPesquisar = (texto: string) => {
    definirTermoBusca(texto);
  };

  return {
    periodoSelecionado,
    aoMudarPeriodo,
    termoBusca,
    aoPesquisar,
    sidebarAberta,
    alternarSidebar,
    menuAtivo,
    definirMenuAtivo,
  };
}
