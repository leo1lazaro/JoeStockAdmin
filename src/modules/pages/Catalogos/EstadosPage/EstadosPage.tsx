import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { criarHooksCatalogo } from '../api/catalogosApi';
import { CatalogoPage } from '../components/CatalogoPage/CatalogoPage';

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

type EstadoPayload = Omit<Estado, 'id'>;

const hooks = criarHooksCatalogo<Estado, EstadoPayload>('estados');

export const EstadosPage: React.FC = () => (
  <CatalogoPage<Estado, EstadoPayload>
    titulo="Estados"
    descricao="Cadastre os estados das cartas e suas siglas."
    nomeSingular="Estado"
    artigo="o"
    icone={<BadgeCheck size={20} />}
    hooks={hooks}
    payloadInicial={{ sigla: '', nome: '' }}
    paraPayload={({ sigla, nome }) => ({ sigla, nome })}
    textoBusca={(item) => `${item.sigla} ${item.nome}`}
    rotuloItem={(item) => item.nome}
    colunas={[
      { titulo: 'Sigla', renderizar: (item) => <span className="catalogo-selo">{item.sigla}</span> },
      { titulo: 'Nome', renderizar: (item) => item.nome },
    ]}
    campos={[
      { nome: 'sigla', rotulo: 'Sigla', tipo: 'texto', obrigatorio: true, maxLength: 10, maiusculas: true },
      { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maxLength: 100 },
    ]}
  />
);
