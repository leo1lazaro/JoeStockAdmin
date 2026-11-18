import { useMemo, useState } from 'react';
import { usePainelStore } from '@/shared/states/usePainelStore';
import { ItemTransacao, useCriarTransacao } from '../hooksChamadaApi/useTransacoesApi';
import { useRealizarTransferenciaApi } from '../hooksChamadaApi/useCartoesApi';

export function useMetodosTransacoes(transacoesIniciais: ItemTransacao[] = []) {
  const { termoBusca, modalTransferenciaAberto, abrirModalTransferencia, fecharModalTransferencia } = usePainelStore();
  const [modalNovaTransacaoAberto, setModalNovaTransacaoAberto] = useState(false);
  const [filtroApenasReceitas, setFiltroApenasReceitas] = useState(false);

  const mutacaoCriarTransacao = useCriarTransacao();
  const mutacaoTransferir = useRealizarTransferenciaApi();

  const transacoesFiltradas = useMemo(() => {
    return transacoesIniciais.filter((item) => {
      const atendeBusca =
        !termoBusca ||
        item.empresa.toLowerCase().includes(termoBusca.toLowerCase()) ||
        item.categoria.toLowerCase().includes(termoBusca.toLowerCase());

      const atendeTipo = !filtroApenasReceitas || item.tipo === 'receita';

      return atendeBusca && atendeTipo;
    });
  }, [transacoesIniciais, termoBusca, filtroApenasReceitas]);

  const aoSubmeterNovaTransacao = async (dados: {
    empresa: string;
    categoria: string;
    valor: number;
    tipo: 'receita' | 'despesa';
  }) => {
    await mutacaoCriarTransacao.mutateAsync(dados);
    setModalNovaTransacaoAberto(false);
  };

  const aoSubmeterTransferencia = async (dados: {
    destinatario: string;
    valor: number;
    cartaoOrigemId: string;
  }) => {
    await mutacaoTransferir.mutateAsync(dados);
    fecharModalTransferencia();
  };

  const alternarFiltroTipo = () => {
    setFiltroApenasReceitas((anterior) => !anterior);
  };

  return {
    transacoesFiltradas,
    termoBusca,
    modalTransferenciaAberto,
    abrirModalTransferencia,
    fecharModalTransferencia,
    modalNovaTransacaoAberto,
    abrirModalNovaTransacao: () => setModalNovaTransacaoAberto(true),
    fecharModalNovaTransacao: () => setModalNovaTransacaoAberto(false),
    aoSubmeterNovaTransacao,
    aoSubmeterTransferencia,
    filtroApenasReceitas,
    alternarFiltroTipo,
    carregandoCriacao: mutacaoCriarTransacao.isPending,
    carregandoTransferencia: mutacaoTransferir.isPending,
  };
}
