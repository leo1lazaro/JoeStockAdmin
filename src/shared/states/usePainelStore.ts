import { create } from 'zustand';

export type PeriodoFiltro = 'este_mes' | 'mes_anterior' | 'ano';
export type MenuNavegacao =
  | 'overview'
  | 'cards'
  | 'banners'
  | 'crypt'
  | 'library'
  | 'groups'
  | 'card_types'
  | 'disciplines'
  | 'languages'
  | 'card_states'
  | 'classifications';

export interface CartaoItem {
  id: string;
  tipo: 'credit' | 'debit' | 'platinum' | 'silver';
  titulo: string;
  numeroMascara: string;
  limiteDisponivel: number;
  gastosAtuais: number;
  bandeira: 'gpay' | 'applepay' | 'stripe' | 'mastercard' | 'visa';
  corGradiente: string;
  subtitulo?: string;
  taxaMensal?: string;
}

interface EstadoPainel {
  // Navegação e Layout
  menuAtivo: MenuNavegacao;
  definirMenuAtivo: (menu: MenuNavegacao) => void;
  sidebarAberta: boolean;
  alternarSidebar: () => void;

  // Filtros e Período
  periodoSelecionado: PeriodoFiltro;
  definirPeriodo: (periodo: PeriodoFiltro) => void;
  termoBusca: string;
  definirTermoBusca: (busca: string) => void;

  // Cartão em Foco
  cartaoAtivoId: string;
  definirCartaoAtivo: (id: string) => void;

  // Modais de Ação
  modalTransferenciaAberto: boolean;
  abrirModalTransferencia: () => void;
  fecharModalTransferencia: () => void;

  modalRecebimentoAberto: boolean;
  abrirModalRecebimento: () => void;
  fecharModalRecebimento: () => void;

  modalConfiguracaoAberto: boolean;
  abrirModalConfiguracao: () => void;
  fecharModalConfiguracao: () => void;
}

export const usePainelStore = create<EstadoPainel>((set) => ({
  menuAtivo: 'overview',
  definirMenuAtivo: (menu) => set({ menuAtivo: menu }),
  sidebarAberta: true,
  alternarSidebar: () => set((estado) => ({ sidebarAberta: !estado.sidebarAberta })),

  periodoSelecionado: 'este_mes',
  definirPeriodo: (periodo) => set({ periodoSelecionado: periodo }),
  termoBusca: '',
  definirTermoBusca: (busca) => set({ termoBusca: busca }),

  cartaoAtivoId: 'card-gpay-gold',
  definirCartaoAtivo: (id) => set({ cartaoAtivoId: id }),

  modalTransferenciaAberto: false,
  abrirModalTransferencia: () => set({ modalTransferenciaAberto: true }),
  fecharModalTransferencia: () => set({ modalTransferenciaAberto: false }),

  modalRecebimentoAberto: false,
  abrirModalRecebimento: () => set({ modalRecebimentoAberto: true }),
  fecharModalRecebimento: () => set({ modalRecebimentoAberto: false }),

  modalConfiguracaoAberto: false,
  abrirModalConfiguracao: () => set({ modalConfiguracaoAberto: true }),
  fecharModalConfiguracao: () => set({ modalConfiguracaoAberto: false }),
}));
