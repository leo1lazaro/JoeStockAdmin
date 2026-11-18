import React from 'react';
import { Tags } from 'lucide-react';
import { criarHooksCatalogo } from '../api/catalogosApi';
import { CatalogoPage } from '../components/CatalogoPage/CatalogoPage';

interface TipoCarta {
  id: number;
  nome: string;
  somenteCripta: boolean;
  somenteLibrary: boolean;
}

type TipoCartaPayload = Omit<TipoCarta, 'id'>;

const hooks = criarHooksCatalogo<TipoCarta, TipoCartaPayload>('tipos-carta');

const escopo = (tipo: TipoCarta) => {
  if (tipo.somenteCripta) return 'Somente cripta';
  if (tipo.somenteLibrary) return 'Somente biblioteca';
  return 'Cripta e biblioteca';
};

export const TiposCartaPage: React.FC = () => (
  <CatalogoPage<TipoCarta, TipoCartaPayload>
    titulo="Tipos de carta"
    descricao="Cadastre os tipos usados para classificar as cartas."
    nomeSingular="Tipo de carta"
    artigo="o"
    icone={<Tags size={20} />}
    hooks={hooks}
    payloadInicial={{ nome: '', somenteCripta: false, somenteLibrary: false }}
    paraPayload={({ nome, somenteCripta, somenteLibrary }) => ({ nome, somenteCripta, somenteLibrary })}
    textoBusca={(item) => item.nome}
    rotuloItem={(item) => item.nome}
    colunas={[
      { titulo: 'Nome', renderizar: (item) => item.nome },
      { titulo: 'Utilização', renderizar: (item) => <span className="catalogo-selo">{escopo(item)}</span> },
    ]}
    campos={[
      { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maxLength: 100, placeholder: 'Ex.: Master' },
      {
        nome: 'somenteCripta',
        rotulo: 'Somente cripta',
        tipo: 'caixa',
        ajuda: 'O tipo só pode ser usado em cartas da cripta.',
      },
      {
        nome: 'somenteLibrary',
        rotulo: 'Somente biblioteca',
        tipo: 'caixa',
        ajuda: 'O tipo só pode ser usado em cartas da biblioteca.',
      },
    ]}
  />
);
