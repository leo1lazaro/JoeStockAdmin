import React from 'react';
import { Layers3 } from 'lucide-react';
import { criarHooksCatalogo } from '../api/catalogosApi';
import { CatalogoPage } from '../components/CatalogoPage/CatalogoPage';

interface Precon { id: number; nome: string; imagemUrl: string | null }
type Payload = { nome: string; imagemUrl: string };
const hooks = criarHooksCatalogo<Precon, Payload>('precons');

export const PreconsPage: React.FC = () => (
  <CatalogoPage<Precon, Payload> titulo="Precons" descricao="Cadastre os precons e seus ícones." nomeSingular="Precon" artigo="o"
    icone={<Layers3 size={20} />} hooks={hooks} payloadInicial={{ nome: '', imagemUrl: '' }}
    paraPayload={(item) => ({ nome: item.nome, imagemUrl: item.imagemUrl ?? '' })} textoBusca={(item) => item.nome} rotuloItem={(item) => item.nome}
    colunas={[{ titulo: 'Ícone', renderizar: (item) => item.imagemUrl ? <img className="catalogo-miniatura" src={item.imagemUrl} alt={item.nome} /> : <span className="catalogo-selo">Sem imagem</span> }, { titulo: 'Nome', renderizar: (item) => item.nome }]}
    campos={[{ nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maxLength: 200 }, { nome: 'imagemUrl', rotulo: 'Ícone', tipo: 'imagem', maxLength: 500, ajuda: 'URL pública ou arquivo PNG, JPEG ou WebP (até 5 MB).' }]} />
);
