import React from 'react';
import { Tags } from 'lucide-react';
import { criarHooksCatalogo } from '../api/catalogosApi';
import { CatalogoPage } from '../components/CatalogoPage/CatalogoPage';

interface TipoCarta {
  id: number;
  nome: string;
  somenteCripta: boolean;
  somenteLibrary: boolean;
  imagemUrl: string | null;
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
    payloadInicial={{ nome: '', somenteCripta: false, somenteLibrary: false, imagemUrl: '' }}
    paraPayload={({ nome, somenteCripta, somenteLibrary, imagemUrl }) => ({ nome, somenteCripta, somenteLibrary, imagemUrl: imagemUrl ?? '' })}
    textoBusca={(item) => item.nome}
    rotuloItem={(item) => item.nome}
    colunas={[
      { titulo: 'Ícone', renderizar: (item) => item.imagemUrl ? <img className="catalogo-miniatura" src={item.imagemUrl} alt={item.nome} /> : <span className="catalogo-selo">Sem imagem</span> },
      { titulo: 'Nome', renderizar: (item) => item.nome },
      { titulo: 'Utilização', renderizar: (item) => <span className="catalogo-selo">{escopo(item)}</span> },
    ]}
    campos={[
      { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maxLength: 100, placeholder: 'Ex.: Master' },
      { nome: 'imagemUrl', rotulo: 'Ícone', tipo: 'imagem', maxLength: 500, ajuda: 'Informe uma URL pública ou importe PNG, JPEG ou WebP (até 5 MB).' },
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
