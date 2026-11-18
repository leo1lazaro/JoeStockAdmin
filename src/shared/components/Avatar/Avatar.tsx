import React from 'react';

interface PropriedadesAvatar {
  urlImagem?: string;
  nome: string;
  tamanho?: number;
  statusOnline?: boolean;
}

export const Avatar: React.FC<PropriedadesAvatar> = ({
  urlImagem,
  nome,
  tamanho = 40,
  statusOnline = true,
}) => {
  return (
    <div
      style={{
        width: `${tamanho}px`,
        height: `${tamanho}px`,
        position: 'relative',
        borderRadius: '50%',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '2px solid #ffffff',
        overflow: 'hidden',
        background: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      title={nome}
    >
      {urlImagem ? (
        <img
          src={urlImagem}
          alt={nome}
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ fontSize: `${tamanho * 0.4}px`, fontWeight: 600, color: '#334155' }}>
          {nome.substring(0, 2).toUpperCase()}
        </span>
      )}
      {statusOnline && (
        <span
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            border: '1.5px solid #ffffff',
          }}
        />
      )}
    </div>
  );
};
