import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';
import './GraficoGastosSemanais.css';

interface PropriedadesGastosSemanais {
  porcentagemBreakdown?: number;
  porcentagemShopping?: number;
  textoTotalSpend?: string;
}

export const GraficoGastosSemanais: React.FC<PropriedadesGastosSemanais> = ({
  porcentagemBreakdown = 56.07,
  porcentagemShopping = 47.93,
  textoTotalSpend = '42% of total spend',
}) => {
  const toast = useNotificacaoToast();

  return (
    <div className="card-gastos-semanais">
      <div className="cabecalho-gastos-semanais">
        <h4 className="titulo-card-gastos">Weekly Spending</h4>
        <button
          className="btn-icone-link-diagonal"
          onClick={() => toast.info('Detalhamento semanal aberto')}
          aria-label="Ver mais gastos semanais"
        >
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="legenda-gastos-semanais">
        <div className="item-legenda-ponto">
          <span className="ponto-marcador escuro" />
          <span>Spending Breakdown</span>
        </div>
        <div className="item-legenda-ponto">
          <span className="ponto-marcador cinza" />
          <span>Shopping</span>
        </div>
      </div>

      {/* Arco Gauge em SVG com arco escuro e base suave */}
      <div className="area-arco-gauge">
        <svg className="svg-arco-gauge" viewBox="0 0 100 55">
          {/* Arco de fundo */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Arco de preenchimento escuro */}
          <path
            d="M 10 50 A 40 40 0 0 1 74 22"
            fill="none"
            stroke="#18191f"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="rodape-estatisticas-gastos">
        <div className="coluna-dado-gasto">
          <div className="linha-porcentagem-gasto tabular-numeros">
            <span>▲ |</span>
            <span>{porcentagemBreakdown}%</span>
          </div>
          <span className="subtexto-gasto-total">{textoTotalSpend}</span>
        </div>

        <div className="coluna-dado-gasto" style={{ alignItems: 'flex-end' }}>
          <div className="linha-porcentagem-gasto tabular-numeros">
            <span>▲ |</span>
            <span>{porcentagemShopping}%</span>
          </div>
          <span className="subtexto-gasto-total">{textoTotalSpend}</span>
        </div>
      </div>
    </div>
  );
};
