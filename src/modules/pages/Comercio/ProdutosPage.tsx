import { useState } from 'react';
import { Botao } from '@/shared/components/Botao/Botao';
import { Modal } from '@/shared/components/Modal/Modal';
import { CampoFormulario, CampoArea } from '@/shared/components/CampoFormulario/CampoFormulario';
import { Select } from '@/shared/components/Select/Select';
import { extrairMensagemErro } from '../Catalogos/api/catalogosApi';
import { moeda, Produto, useProdutos, useSalvarProduto } from './api/comercioApi';
import { EstruturaGestao, EstadoGestao } from './components/EstruturaGestao';
const vazio: Produto = { id: 0, nome: '', descricao: '', imagem: '', categoria: 'single', origem: 'nacional', subcategoria: 'outros', preco: 0, estoque: 0, ativo: true, cartaId: null };
export function ProdutosPage({ estoque = false }: { estoque?: boolean }) {
  const consulta = useProdutos();
  const salvar = useSalvarProduto();
  const [busca, definirBusca] = useState('');
  const [filtro, definirFiltro] = useState('todos');
  const [produto, definirProduto] = useState<Produto | null>(null);
  const [erro, definirErro] = useState('');
  const itens = (consulta.data ?? []).filter((item) => item.nome.toLowerCase().includes(busca.toLowerCase()) && (filtro === 'todos' || filtro === 'baixo' && item.estoque <= 5 || filtro === 'inativo' && !item.ativo));
  function editar(item: Produto) { definirProduto({ ...item }); definirErro(''); }
  function campo<K extends keyof Produto>(nome: K, valor: Produto[K]) { definirProduto((atual) => atual ? { ...atual, [nome]: valor } : atual); }
  async function enviar(evento: React.FormEvent) {
    evento.preventDefault(); if (!produto || salvar.isPending) return;
    try { await salvar.mutateAsync(produto); definirProduto(null); } catch (falha) { definirErro(extrairMensagemErro(falha)); }
  }
  return <EstruturaGestao titulo={estoque ? 'Estoque' : 'Produtos'} descricao="Gerencie preços, disponibilidade e produtos publicados na loja." acoes={<div className="Comercio-acoes"><Botao onClick={() => void consulta.refetch()}>Atualizar</Botao><Botao variante="primario" onClick={() => editar(vazio)}>Novo produto</Botao></div>}>
    <div className="Comercio-ferramentas"><CampoFormulario rotulo="Buscar produto" type="search" value={busca} onChange={(evento) => definirBusca(evento.target.value)} /><Select valor={filtro} aoAlterar={definirFiltro} rotuloAcessivel="Filtrar produtos" opcoes={[{ valor: 'todos', rotulo: 'Todos' }, { valor: 'baixo', rotulo: 'Estoque baixo (até 5)' }, { valor: 'inativo', rotulo: 'Inativos' }]} /></div>
    <EstadoGestao carregando={consulta.isPending} erro={consulta.isError} repetir={() => void consulta.refetch()} />
    {consulta.isSuccess && <section className="Comercio-card Comercio-tabela-container"><table className="Comercio-tabela"><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Situação</th><th>Ações</th></tr></thead><tbody>
      {itens.map((item) => <tr key={item.id}><td><strong>{item.nome}</strong><small>#{item.id} · {item.origem}</small></td><td>{item.categoria}</td><td>{moeda(item.preco)}</td><td className={item.estoque <= 5 ? 'Comercio-alerta' : ''}>{item.estoque} un.</td><td><span className="Comercio-status">{item.ativo ? 'Publicado' : 'Inativo'}</span></td><td><Botao onClick={() => editar(item)}>Editar</Botao></td></tr>)}
      {!itens.length && <tr><td colSpan={6}>Nenhum produto encontrado. Cadastre o primeiro produto para disponibilizá-lo na loja.</td></tr>}
    </tbody></table></section>}
    <Modal aberto={!!produto} aoFechar={() => { if (!salvar.isPending) definirProduto(null); }} titulo={produto?.id ? 'Editar produto' : 'Novo produto'} rodape={<Botao variante="primario" type="submit" form="produto-formulario" disabled={salvar.isPending}>{salvar.isPending ? 'Salvando…' : 'Salvar produto'}</Botao>}>
      {produto && <form id="produto-formulario" className="Comercio-formulario" onSubmit={enviar}>
        <CampoFormulario rotulo="Nome" required maxLength={160} value={produto.nome} onChange={(e) => campo('nome', e.target.value)} />
        <CampoArea rotulo="Descrição" maxLength={4000} value={produto.descricao} onChange={(e) => campo('descricao', e.target.value)} />
        <CampoFormulario rotulo="URL da imagem" type="url" maxLength={2000} value={produto.imagem} onChange={(e) => campo('imagem', e.target.value)} />
        <div className="Comercio-linha"><label className="Comercio-selecao">Categoria<Select valor={produto.categoria} aoAlterar={(valor) => campo('categoria', valor)} opcoes={[{ valor: 'single', rotulo: 'Carta avulsa' }, { valor: 'selado', rotulo: 'Selado' }, { valor: 'acessorio', rotulo: 'Acessório' }]} /></label>
        <label className="Comercio-selecao">Origem<Select valor={produto.origem} aoAlterar={(valor) => campo('origem', valor)} opcoes={[{ valor: 'nacional', rotulo: 'Nacional' }, { valor: 'importado', rotulo: 'Importado' }]} /></label></div>
        {produto.categoria === 'selado' && <label className="Comercio-selecao">Tipo de selado<Select valor={produto.subcategoria} aoAlterar={(valor) => campo('subcategoria', valor)} opcoes={[{ valor: 'decks', rotulo: 'Decks' }, { valor: 'new-bloods', rotulo: 'New Bloods' }, { valor: 'bundles', rotulo: 'Bundles' }, { valor: 'outros', rotulo: 'Outros' }]} /></label>}
        <div className="Comercio-linha"><CampoFormulario rotulo="Preço (R$)" type="number" min="0.01" max="99999999" step="0.01" required value={produto.preco} onChange={(e) => campo('preco', Number(e.target.value))} />
        <CampoFormulario rotulo="Estoque disponível" type="number" min={0} max={1000000} step={1} required value={produto.estoque} onChange={(e) => campo('estoque', Number(e.target.value))} /></div>
        <CampoFormulario rotulo="ID da carta vinculada (opcional)" type="number" min={1} value={produto.cartaId ?? ''} onChange={(e) => campo('cartaId', e.target.value ? Number(e.target.value) : null)} />
        <CampoFormulario rotulo="Publicado na loja" type="checkbox" checked={produto.ativo} onChange={(e) => campo('ativo', e.target.checked)} />
        <p>O estoque informado substitui a quantidade disponível atual. Produtos inativos deixam de aparecer na loja.</p>
        {erro && <p role="alert" className="Comercio-alerta">{erro}</p>}
      </form>}
    </Modal></EstruturaGestao>;
}
