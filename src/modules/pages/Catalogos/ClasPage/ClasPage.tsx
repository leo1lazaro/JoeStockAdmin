import React from 'react';
import { Users } from 'lucide-react';
import { criarHooksCatalogo } from '../api/catalogosApi';
import { CatalogoPage } from '../components/CatalogoPage/CatalogoPage';

interface Clan { id: number; nome: string; imagemUrl: string | null }
type Payload = { nome: string; imagemUrl: string };
const hooks = criarHooksCatalogo<Clan, Payload>('clas');

export const ClasPage: React.FC = () => (
  <CatalogoPage<Clan, Payload> titulo="Clãs" descricao="Cadastre os clãs e seus ícones." nomeSingular="Clã" artigo="o"
    icone={<Users size={20} />} hooks={hooks} payloadInicial={{ nome: '', imagemUrl: '' }}
    paraPayload={(item) => ({ nome: item.nome, imagemUrl: item.imagemUrl ?? '' })} textoBusca={(item) => item.nome} rotuloItem={(item) => item.nome}
    colunas={[{ titulo: 'Ícone', renderizar: (item) => item.imagemUrl ? <img className="catalogo-miniatura" src={item.imagemUrl} alt={item.nome} /> : <span className="catalogo-selo">Sem imagem</span> }, { titulo: 'Nome', renderizar: (item) => item.nome }]}
    campos={[{ nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maxLength: 100 }, { nome: 'imagemUrl', rotulo: 'Ícone', tipo: 'imagem', maxLength: 500, ajuda: 'URL pública ou arquivo PNG, JPEG ou WebP (até 5 MB).' }]} />
);
