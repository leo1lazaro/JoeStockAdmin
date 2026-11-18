import React from 'react';
import { Languages } from 'lucide-react';
import { criarHooksCatalogo } from '../api/catalogosApi';
import { CatalogoPage } from '../components/CatalogoPage/CatalogoPage';

interface Idioma {
  id: number;
  nome: string;
}

type IdiomaPayload = Omit<Idioma, 'id'>;

const hooks = criarHooksCatalogo<Idioma, IdiomaPayload>('idiomas');

export const IdiomasPage: React.FC = () => (
  <CatalogoPage<Idioma, IdiomaPayload>
    titulo="Idiomas"
    descricao="Cadastre os idiomas disponíveis para as cartas."
    nomeSingular="Idioma"
    artigo="o"
    icone={<Languages size={20} />}
    hooks={hooks}
    payloadInicial={{ nome: '' }}
    paraPayload={({ nome }) => ({ nome })}
    textoBusca={(item) => item.nome}
    rotuloItem={(item) => item.nome}
    colunas={[{ titulo: 'Nome', renderizar: (item) => item.nome }]}
    campos={[
      { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maxLength: 100, placeholder: 'Ex.: Português' },
    ]}
  />
);
