import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatarMoeda } from '@/shared/helpers/formatadores';
import { useMetodosDashboard } from '../../hooks/hooksMetodosPagina/useMetodosDashboard';
import './GraficoRendaDespesas.css';

interface DadosMesEqualizador {
  mes: string;
  renda: number; // altura relativa
  despesa: number;
  destaque?: boolean;
}

interface PropriedadesGraficoRendaDespesas {
  totalRenda?: number;
  totalDespesas?: number;
  destaqueValor?: number;
  mesesDados?: DadosMesEqualizador[];
}

export const GraficoRendaDespesas: React.FC<PropriedadesGraficoRendaDespesas> = ({
  totalRenda = 578395.00,
  totalDespesas = 578395.00,
  destaqueValor = 4699.00,
  mesesDados = [
    { mes: 'Jan', renda: 32, despesa: 28 },
    { mes: 'Feb', renda: 52, despesa: 48 },
    { mes: 'Mar', renda: 68, despesa: 62 },
    { mes: 'Apr', renda: 96, despesa: 96, destaque: true },
    { mes: 'May', renda: 64, despesa: 58 },
    { mes: 'Jun', renda: 48, despesa: 42 },
    { mes: 'Jul', renda: 30, despesa: 26 },
  ],
}) => {
  const { aoMudarPeriodo } = useMetodosDashboard();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('This Month');

  const selecionarOpcao = (opcao: string, periodo: 'este_mes' | 'mes_anterior' | 'ano') => {
    setOpcaoSelecionada(opcao);
    setDropdownAberto(false);
    aoMudarPeriodo(periodo);
  };

  return (
    <div className="card-grafico-renda-despesas">
      {/* Cabeçalho */}
      <div className="cabecalho-grafico-espelho">
        <h3 className="titulo-secao-grafico">Total Income</h3>

        <div style={{ position: 'relative' }}>
          <button
            className="seletor-periodo-dropdown"
            onClick={() => setDropdownAberto(!dropdownAberto)}
          >
            <span>{opcaoSelecionada}</span>
            <ChevronDown size={13} />
          </button>

          {dropdownAberto && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: '#ffffff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(0,0,0,0.06)',
                zIndex: 20,
                minWidth: '120px',
                overflow: 'hidden',
              }}
            >
              <button
                style={{ width: '100%', padding: '8px 12px', fontSize: '12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => selecionarOpcao('This Month', 'este_mes')}
              >
                This Month
              </button>
              <button
                style={{ width: '100%', padding: '8px 12px', fontSize: '12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => selecionarOpcao('Last Month', 'mes_anterior')}
              >
                Last Month
              </button>
              <button
                style={{ width: '100%', padding: '8px 12px', fontSize: '12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => selecionarOpcao('This Year', 'ano')}
              >
                This Year
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Renda Total em Destaque */}
      <div className="bloco-valor-central">
        <span className="subtitulo-renda-despesa">My Income</span>
        <div className="grande-valor-destaque tabular-numeros">
          {formatarMoeda(totalRenda)}
        </div>
      </div>

      {/* Equalizador Espelhado com Barras Verticais */}
      <div className="area-equalizador-espelhado">
        {/* Metade Superior: Barras de Renda */}
        <div className="colunas-barras-grafico" style={{ height: '90px', alignItems: 'flex-end' }}>
          {mesesDados.map((item) => {
            const numeroBarras = item.destaque ? 7 : 5;
            const barrasArray = Array.from({ length: numeroBarras });

            return (
              <div
                key={`topo-${item.mes}`}
                className={`coluna-mes-equalizador ${item.destaque ? 'destaque' : ''}`}
              >
                {item.destaque && (
                  <span className="tag-valor-flutuante topo tabular-numeros" style={{ right: '-50px' }}>
                    {formatarMoeda(destaqueValor)}
                  </span>
                )}
                <div className="grupo-barras-topo">
                  {barrasArray.map((_, idx) => {
                    const fator = item.destaque ? 1 : (idx === 2 ? 1 : 0.85);
                    const alturaPx = Math.max(12, Math.round((item.renda * 0.85) * fator));

                    return (
                      <div
                        key={`b-topo-${item.mes}-${idx}`}
                        className="barra-linha topo"
                        style={{ height: `${alturaPx}px` }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Eixo Central com Meses */}
        <div className="linha-meses-eixo">
          {mesesDados.map((item) => (
            <span
              key={`rotulo-${item.mes}`}
              className={`rotulo-mes-eixo ${item.destaque ? 'ativo' : ''}`}
            >
              {item.mes}
            </span>
          ))}
        </div>

        {/* Metade Inferior: Barras de Despesa */}
        <div className="colunas-barras-grafico" style={{ height: '90px', alignItems: 'flex-start' }}>
          {mesesDados.map((item) => {
            const numeroBarras = item.destaque ? 7 : 5;
            const barrasArray = Array.from({ length: numeroBarras });

            return (
              <div
                key={`base-${item.mes}`}
                className={`coluna-mes-equalizador ${item.destaque ? 'destaque' : ''}`}
              >
                <div className="grupo-barras-base">
                  {barrasArray.map((_, idx) => {
                    const fator = item.destaque ? 1 : (idx === 2 ? 1 : 0.85);
                    const alturaPx = Math.max(12, Math.round((item.despesa * 0.85) * fator));

                    return (
                      <div
                        key={`b-base-${item.mes}-${idx}`}
                        className="barra-linha base"
                        style={{ height: `${alturaPx}px` }}
                      />
                    );
                  })}
                </div>
                {item.destaque && (
                  <span className="tag-valor-flutuante base tabular-numeros" style={{ left: '-55px' }}>
                    {formatarMoeda(destaqueValor)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Despesas Totais em Destaque */}
      <div className="bloco-valor-central">
        <span className="subtitulo-renda-despesa">My Expenses</span>
        <div className="grande-valor-destaque tabular-numeros">
          {formatarMoeda(totalDespesas)}
        </div>
      </div>
    </div>
  );
};
