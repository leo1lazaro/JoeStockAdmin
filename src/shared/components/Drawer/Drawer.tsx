import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Drawer.css';

export interface PropriedadesDrawer {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  largura?: number;
}

export const Drawer: React.FC<PropriedadesDrawer> = ({
  aberto,
  aoFechar,
  titulo,
  subtitulo,
  children,
  rodape,
  largura = 520,
}) => {
  useEffect(() => {
    if (!aberto) return;

    const tratarTeclaEsc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') aoFechar();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', tratarTeclaEsc);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', tratarTeclaEsc);
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div className="drawer-overlay" onClick={aoFechar}>
      <aside
        className="drawer-painel"
        style={{ maxWidth: largura }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-titulo-id"
      >
        <div className="drawer-cabecalho">
          <div>
            <h3 id="drawer-titulo-id" className="drawer-titulo">
              {titulo}
            </h3>
            {subtitulo && <p className="drawer-subtitulo">{subtitulo}</p>}
          </div>
          <button className="drawer-fechar" onClick={aoFechar} aria-label="Fechar painel">
            <X size={18} />
          </button>
        </div>
        <div className="drawer-conteudo">{children}</div>
        {rodape && <div className="drawer-rodape">{rodape}</div>}
      </aside>
    </div>
  );
};
