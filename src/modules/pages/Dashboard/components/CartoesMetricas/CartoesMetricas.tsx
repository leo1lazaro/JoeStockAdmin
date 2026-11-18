import React from 'react';
import { Triangle } from 'lucide-react';
import { formatarMoeda } from '@/shared/helpers/formatadores';
import './CartoesMetricas.css';

export interface ItemMetrica {
  id: string;
  titulo: string;
  valor: number;
  porcentagemVariacao: number;
  tipoVariacao: 'alta' | 'baixa';
  pontosGrafico?: number[];
}

interface PropriedadesCartoesMetricas {
  metricas?: ItemMetrica[];
}

export const CartoesMetricas: React.FC<PropriedadesCartoesMetricas> = ({ metricas = [] }) => {
  const metricasPadrao: ItemMetrica[] = metricas.length > 0 ? metricas : [
    {
      id: 'saldo',
      titulo: 'Total Balance',
      valor: 5465.00,
      porcentagemVariacao: 6.3,
      tipoVariacao: 'alta',
    },
    {
      id: 'renda',
      titulo: 'Total Income',
      valor: 8395.00,
      porcentagemVariacao: 7.1,
      tipoVariacao: 'alta',
    },
    {
      id: 'despesas',
      titulo: 'Total Expenses',
      valor: 2455.00,
      porcentagemVariacao: -5.7,
      tipoVariacao: 'baixa',
    },
    {
      id: 'poupanca',
      titulo: 'Total Savings',
      valor: 4320.00,
      porcentagemVariacao: 5.2,
      tipoVariacao: 'alta',
    },
  ];

  return (
    <div className="container-metricas-resumo" aria-label="Métricas de resumo">
      {metricasPadrao.map((item) => {
        const ehAlta = item.tipoVariacao === 'alta';
        const valorFormatado = formatarMoeda(item.valor);
        const variacaoTexto = `${ehAlta ? '▲' : '▼'} ${Math.abs(item.porcentagemVariacao)}%`;

        return (
          <div key={item.id} className="card-metrica-item">
            <span className="metrica-titulo-rotulo">{item.titulo}</span>
            <div className="metrica-corpo-linha">
              <span className="metrica-valor-principal tabular-numeros">
                {valorFormatado}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`metrica-badge-variacao ${ehAlta ? 'alta' : 'baixa'}`}>
                  {variacaoTexto}
                </span>

                <svg className="metrica-sparkline-svg" viewBox="0 0 54 24" preserveAspectRatio="none">
                  {ehAlta ? (
                    <path
                      d="M2 18 L8 14 L14 17 L20 10 L26 13 L32 7 L38 11 L44 5 L52 2"
                      fill="none"
                      stroke="#8e97a6"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M2 6 L8 10 L14 8 L20 15 L26 12 L32 18 L38 14 L44 20 L52 22"
                      fill="none"
                      stroke="#8e97a6"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
