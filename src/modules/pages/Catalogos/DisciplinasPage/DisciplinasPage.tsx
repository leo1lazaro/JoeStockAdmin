import React from 'react';
import { Sparkles } from 'lucide-react';
import { criarHooksCatalogo } from '../api/catalogosApi';
import { CatalogoPage } from '../components/CatalogoPage/CatalogoPage';

interface Disciplina {
  id: number;
  nome: string;
  imagemUrl: string | null;
}

type DisciplinaPayload = { nome: string; imagemUrl: string };

const hooks = criarHooksCatalogo<Disciplina, DisciplinaPayload>('disciplinas');

export const DisciplinasPage: React.FC = () => (
  <CatalogoPage<Disciplina, DisciplinaPayload>
    titulo="Disciplinas"
    descricao="Cadastre as disciplinas e o ícone de cada uma."
    nomeSingular="Disciplina"
    artigo="a"
    icone={<Sparkles size={20} />}
    hooks={hooks}
    payloadInicial={{ nome: '', imagemUrl: '' }}
    paraPayload={({ nome, imagemUrl }) => ({ nome, imagemUrl: imagemUrl ?? '' })}
    textoBusca={(item) => item.nome}
    rotuloItem={(item) => item.nome}
    colunas={[
      {
        titulo: 'Imagem',
        renderizar: (item) =>
          item.imagemUrl ? (
            <img className="catalogo-miniatura" src={item.imagemUrl} alt={item.nome} loading="lazy" />
          ) : (
            <span className="catalogo-selo">Sem imagem</span>
          ),
      },
      { titulo: 'Nome', renderizar: (item) => item.nome },
    ]}
    campos={[
      { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maxLength: 100, placeholder: 'Ex.: Dominate' },
      {
        nome: 'imagemUrl',
        rotulo: 'URL da imagem',
        tipo: 'texto',
        maxLength: 500,
        placeholder: 'https://...',
        ajuda: 'Opcional.',
      },
    ]}
  />
);
