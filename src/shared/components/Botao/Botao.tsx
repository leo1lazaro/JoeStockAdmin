import React from 'react';
import './Botao.css';

export interface PropriedadesBotao extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'fantasma' | 'icone';
  icone?: React.ReactNode;
  rotulo?: string;
  classeExtra?: string;
}

export const Botao: React.FC<PropriedadesBotao> = ({
  children,
  variante = 'secundario',
  icone,
  rotulo,
  classeExtra = '',
  ...restoProps
}) => {
  return (
    <button
      className={`btn-padrao btn-${variante} ${classeExtra}`}
      {...restoProps}
    >
      {icone && <span className="btn-icone-slot">{icone}</span>}
      {rotulo || children}
    </button>
  );
};
