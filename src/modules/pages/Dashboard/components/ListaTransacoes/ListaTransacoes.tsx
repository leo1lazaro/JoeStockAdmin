import React from 'react';
import { Search, SlidersHorizontal, Coffee, Hash, Smartphone } from 'lucide-react';
import { formatarMoeda } from '@/shared/helpers/formatadores';
import { ItemTransacao } from '../../hooks/hooksChamadaApi/useTransacoesApi';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';
import './ListaTransacoes.css';

interface PropriedadesListaTransacoes {
  transacoes?: ItemTransacao[];
  aoClicarVerTodas?: () => void;
  aoClicarNova?: () => void;
}

export const ListaTransacoes: React.FC<PropriedadesListaTransacoes> = ({
  transacoes = [],
  aoClicarVerTodas,
  aoClicarNova,
}) => {
  const toast = useNotificacaoToast();

  const transacoesPadrao: ItemTransacao[] = transacoes.length > 0 ? transacoes : [
    {
      id: '1',
      empresa: 'Starbucks',
      categoria: 'Food & Drink',
      data: 'Nov 12, 26',
      valor: 515.75,
      tipo: 'receita',
      tipoLabel: 'Income',
      icone: 'starbucks',
    },
    {
      id: '2',
      empresa: 'Netflix',
      categoria: 'Entertainment',
      data: 'Nov 12, 26',
      valor: -59.99,
      tipo: 'despesa',
      tipoLabel: 'Transfer',
      icone: 'netflix',
    },
    {
      id: '3',
      empresa: 'Apple Store',
      categoria: 'Electronics',
      data: 'Nov 12, 26',
      valor: -75.99,
      tipo: 'despesa',
      tipoLabel: 'Transfer',
      icone: 'apple',
    },
    {
      id: '4',
      empresa: 'Slack',
      categoria: 'Electronics',
      data: 'Nov 12, 26',
      valor: -59.99,
      tipo: 'despesa',
      tipoLabel: '',
      icone: 'slack',
    },
  ];

  const renderizarIconeEmpresa = (icone: string, empresa: string) => {
    switch (icone) {
      case 'starbucks':
        return (
          <div className="icone-empresa-wrapper icone-starbucks" title="Starbucks Coffee">
            <Coffee size={16} />
          </div>
        );
      case 'netflix':
        return (
          <div className="icone-empresa-wrapper icone-netflix" title="Netflix">
            <span style={{ fontWeight: 800, fontSize: '15px' }}>N</span>
          </div>
        );
      case 'apple':
        return (
          <div className="icone-empresa-wrapper icone-apple" title="Apple">
            <span style={{ fontSize: '14px' }}></span>
          </div>
        );
      case 'slack':
        return (
          <div className="icone-empresa-wrapper icone-slack" title="Slack Technologies">
            <Hash size={16} color="#611f69" />
          </div>
        );
      default:
        return (
          <div className="icone-empresa-wrapper" style={{ background: '#f1f5f9', color: '#475569' }}>
            <span>{empresa.substring(0, 2).toUpperCase()}</span>
          </div>
        );
    }
  };

  return (
    <div className="card-lista-transacoes">
      <div className="cabecalho-transacoes">
        <h4 className="titulo-card-transacoes">Transactions</h4>
        <div className="controles-cabecalho-transacoes">
          <button
            className="btn-icone-transacao"
            onClick={() => toast.info('Campo de busca de transações')}
            aria-label="Buscar transações"
          >
            <Search size={13} />
          </button>
          <button
            className="btn-icone-transacao"
            onClick={() => toast.info('Filtro de transações aplicado')}
            aria-label="Filtrar transações"
          >
            <SlidersHorizontal size={13} />
          </button>
          <button
            className="btn-ver-todas"
            onClick={aoClicarVerTodas || (() => toast.info('Visualizando histórico completo'))}
          >
            View All
          </button>
        </div>
      </div>

      <div className="divisor-data-transacoes">Yesterday</div>

      <div className="itens-transacoes-container">
        {transacoesPadrao.map((item) => {
          const ehPositivo = item.valor > 0;
          const sinal = ehPositivo ? '+' : '';
          const valorFormatado = `${sinal}${formatarMoeda(item.valor)}`;

          return (
            <div key={item.id} className="item-transacao-linha">
              <div className="lado-esquerdo-transacao">
                {renderizarIconeEmpresa(item.icone, item.empresa)}
                <div className="detalhes-empresa-transacao">
                  <span className="nome-empresa-transacao">{item.empresa}</span>
                  <span className="categoria-data-transacao">
                    {item.categoria} · {item.data}
                  </span>
                </div>
              </div>

              <div className="lado-direito-transacao">
                <span
                  className={`valor-transacao-item tabular-numeros ${
                    ehPositivo ? 'positivo' : 'negativo'
                  }`}
                >
                  {valorFormatado}
                </span>
                {item.tipoLabel && (
                  <span
                    className={`tipo-subtexto-transacao ${
                      ehPositivo ? 'verde' : 'vermelho'
                    }`}
                  >
                    {ehPositivo ? '▲' : '▼'} {item.tipoLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
