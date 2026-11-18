import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export interface PropriedadesModal {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
}

export const Modal: React.FC<PropriedadesModal> = ({
  aberto,
  aoFechar,
  titulo,
  children,
  rodape,
}) => {
  useEffect(() => {
    const tratarTeclaEsc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        aoFechar();
      }
    };

    if (aberto) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', tratarTeclaEsc);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', tratarTeclaEsc);
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={aoFechar}>
      <div
        className="modal-janela"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo-id"
      >
        <div className="modal-cabecalho">
          <h3 id="modal-titulo-id" className="modal-titulo">
            {titulo}
          </h3>
          <button className="modal-fechar" onClick={aoFechar} aria-label="Fechar modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-conteudo">{children}</div>
        {rodape && <div className="modal-rodape">{rodape}</div>}
      </div>
    </div>
  );
};
