import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';
import './GraficoVisaoMensal.css';

interface PropriedadesVisaoMensal {
  porcentagemPico?: number;
  meses?: string[];
}

export const GraficoVisaoMensal: React.FC<PropriedadesVisaoMensal> = ({
  porcentagemPico = 8.2,
  meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
}) => {
  const toast = useNotificacaoToast();

  return (
    <div className="card-visao-mensal">
      <div className="cabecalho-visao-mensal">
        <h4 className="titulo-card-mensal">Monthly Overview</h4>
        <button
          className="btn-icone-link-diagonal"
          onClick={() => toast.info('Visão analítica mensal expandida')}
          aria-label="Ver mais visão mensal"
        >
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="area-ondas-senoidais">
        {/* Badge do Pico */}
        <div className="badge-pico-flutuante tabular-numeros">
          +{porcentagemPico}%
        </div>

        {/* Curvas Senoidais Entrelaçadas Idênticas ao Design */}
        <svg className="svg-ondas-senoidais" viewBox="0 0 280 85" preserveAspectRatio="none">
          {/* Linha vertical de referência no pico */}
          <line
            x1="225"
            y1="22"
            x2="225"
            y2="75"
            stroke="#18191f"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
          {/* Ponto no pico */}
          <circle cx="225" cy="22" r="3.5" fill="#18191f" />

          {/* Onda 1 Principal (Escura) */}
          <path
            d="M 10 50 C 45 75, 75 25, 110 50 C 145 75, 175 25, 210 50 C 220 30, 225 22, 235 40 C 255 70, 270 55, 275 50"
            fill="none"
            stroke="#20242c"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Onda 2 Cruzada (Cinza Média) */}
          <path
            d="M 10 52 C 45 25, 75 75, 110 50 C 145 25, 175 75, 210 48 C 230 65, 255 35, 275 52"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Onda 3 Suave de Fundo */}
          <path
            d="M 10 45 C 50 40, 80 60, 120 45 C 160 30, 190 65, 230 45 C 255 35, 265 55, 275 48"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="eixo-meses-mensal">
        {meses.map((m) => (
          <span key={m} className="rotulo-mes-pequeno">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
};
