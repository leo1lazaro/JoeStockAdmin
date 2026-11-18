import type { ReactNode } from 'react';
import { Botao } from '@/shared/components/Botao/Botao';
import '../Comercio.css';
export function EstruturaGestao({ titulo, descricao, children, acoes }: { titulo: string; descricao: string; children: ReactNode; acoes?: ReactNode }) {
  return <main className="Comercio"><header className="Comercio-cabecalho"><div><p className="Comercio-marca">JOESTOCK / GESTÃO</p><h1>{titulo}</h1><p>{descricao}</p></div>{acoes}</header>{children}</main>;
}
export function EstadoGestao({ carregando, erro, repetir }: { carregando: boolean; erro: boolean; repetir: () => void }) {
  if (carregando) return <p className="Comercio-estado" role="status">Carregando dados da loja…</p>;
  if (erro) return <div className="Comercio-estado" role="alert"><p>Não foi possível carregar os dados.</p><Botao onClick={repetir}>Tentar novamente</Botao></div>;
  return null;
}
