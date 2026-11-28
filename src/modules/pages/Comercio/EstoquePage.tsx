import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, RotateCw, Save, Search } from 'lucide-react';
import { clienteApi } from '@/app/config/apiConfig';
import { Botao } from '@/shared/components/Botao/Botao';
import { useAlteracoesPendentes } from '@/shared/hooks/useAlteracoesPendentes';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';
import { extrairMensagemErro } from '@/modules/pages/Catalogos/api/catalogosApi';
import { EstruturaGestao, EstadoGestao } from './components/EstruturaGestao';
import { LancamentoEstoque } from './Estoque/LancamentoEstoque';
import { EstoqueGrupo } from './Estoque/EstoqueGrupo';
import { type AjustesEstoque, type LinhaEstoque, type RespostaEstoque, alterarAjuste, criarLote, dadosEstoque, listarEstoque, quantidadeValida } from './Estoque/estoque';
import './EstoquePage.css';

export function EstoquePage() {
  const cache = useQueryClient();
  const toast = useNotificacaoToast();
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [tamanho, setTamanho] = useState(20);
  const [abertos, setAbertos] = useState<Record<number, boolean>>({});
  const [ajustes, setAjustes] = useState<AjustesEstoque>({});
  const [cadastroPendente, setCadastroPendente] = useState(false);
  const [cadastroSalvando, setCadastroSalvando] = useState(false);
  const itens = Object.values(ajustes);
  const invalidos = itens.some(i => !quantidadeValida(i.texto)) || itens.length > 500;
  const cartasAlteradas = new Set(itens.map(i => i.cartasId)).size;
  const consulta = useQuery({ queryKey: ['admin', 'estoque', 'agrupado', termo, pagina, tamanho], queryFn: () => listarEstoque(termo, pagina, tamanho) });

  async function atualizarConsultas() {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ['admin', 'estoque'] }),
      cache.invalidateQueries({ queryKey: ['admin', 'cartas'] }),
      cache.invalidateQueries({ queryKey: ['admin', 'carta'] }),
      cache.invalidateQueries({ queryKey: ['cartas'] }),
    ]);
  }
  const salvar = useMutation({ mutationFn: async (payload: ReturnType<typeof criarLote>) => dadosEstoque((await clienteApi.put<RespostaEstoque<unknown>>('/admin/estoque/lote', payload)).data),
    onSuccess: async () => { setAjustes({}); await atualizarConsultas(); toast.sucesso('Todas as quantidades foram salvas.'); },
    onError: () => { void cache.invalidateQueries({ queryKey: ['admin', 'estoque', 'agrupado'] }); },
    meta: { desativarNotificacao: true },
  });
  const ocupado = salvar.isPending || cadastroSalvando;
  const { confirmar, modal } = useAlteracoesPendentes(itens.length > 0 || cadastroPendente || ocupado, ocupado);
  const alterar = (linha: LinhaEstoque, texto: string) => { salvar.reset(); setAjustes(atuais => alterarAjuste(atuais, linha, texto)); };
  const revisar = (linha: LinhaEstoque) => {
    salvar.reset();
    setAjustes(atuais => {
      const novos = { ...atuais }; const item = novos[linha.id];
      if (!item) return atuais;
      if (quantidadeValida(item.texto) && Number(item.texto) === linha.quantidade) delete novos[linha.id];
      else novos[linha.id] = { ...item, anterior: linha.quantidade };
      return novos;
    });
  };
  const salvarTudo = () => { if (!invalidos && itens.length && !ocupado) salvar.mutate(criarLote(ajustes)); };
  const totalPaginas = Math.max(1, consulta.data?.totalPaginas ?? 1);

  return <EstruturaGestao titulo="Estoque" descricao="Ajuste as quantidades por carta e salve todas as alterações de uma vez.">
    <LancamentoEstoque aoSalvar={async () => { await atualizarConsultas(); toast.sucesso('Combinação cadastrada.'); }} aoPendente={setCadastroPendente} aoSalvando={setCadastroSalvando} confirmar={confirmar} bloqueado={salvar.isPending} />
    <section className="Comercio-card Estoque-lista">
      <div className="Estoque-lista-cabecalho"><div><h2>Estoque por carta / produto</h2><p>{consulta.data?.total ?? 0} produtos · Expanda para ajustar as combinações.</p></div>
        <form className="Estoque-filtros" onSubmit={e => { e.preventDefault(); setTermo(busca.trim()); setPagina(1); }}>
          <label className="Estoque-busca"><Search size={16} /><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar carta, edição ou idioma" aria-label="Buscar no estoque" /></label>
          <Botao type="submit" disabled={consulta.isFetching}>Buscar</Botao>
          <Botao type="button" variante="icone" aria-label="Atualizar saldos mantendo os ajustes" title="Atualizar saldos mantendo os ajustes" disabled={consulta.isFetching || salvar.isPending} onClick={() => void consulta.refetch()}><RotateCw size={16} /></Botao>
        </form>
      </div>
      <EstadoGestao carregando={consulta.isLoading} erro={consulta.isError} repetir={() => void consulta.refetch()} />
      {consulta.isSuccess && <>
        <div className="Estoque-produtos">
          {consulta.data.itens.map(grupo => <EstoqueGrupo key={grupo.cartasId} grupo={grupo} aberto={!!abertos[grupo.cartasId]} alternar={() => setAbertos(atual => ({ ...atual, [grupo.cartasId]: !atual[grupo.cartasId] }))}
            ajustes={ajustes} alterar={alterar} revisar={revisar} bloqueado={ocupado} />)}
          {!consulta.data.itens.length && <p className="Estoque-vazio">{termo ? 'Nenhum produto encontrado para esta busca.' : 'Nenhuma combinação cadastrada. Use o cadastro acima para começar.'}</p>}
        </div>
        <div className="Estoque-paginacao">
          <label>Produtos por página <select value={tamanho} onChange={e => { setTamanho(Number(e.target.value)); setPagina(1); }}><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></label>
          <div><button type="button" disabled={pagina <= 1} aria-label="Página anterior" onClick={() => setPagina(p => Math.max(1, p - 1))}><ChevronLeft size={17} /></button><span>Página {pagina} de {totalPaginas}</span><button type="button" disabled={pagina >= totalPaginas} aria-label="Próxima página" onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}><ChevronRight size={17} /></button></div>
        </div>
      </>}
    </section>
    {(!!itens.length || salvar.isPending || salvar.isError) && <section className="Estoque-salvar-lote" aria-label="Alterações pendentes">
      <div><strong role="status">{salvar.isPending ? 'Salvando alterações…' : `${itens.length} ${itens.length === 1 ? 'combinação alterada' : 'combinações alteradas'} em ${cartasAlteradas} ${cartasAlteradas === 1 ? 'produto' : 'produtos'}`}</strong><p>Os ajustes são mantidos ao buscar, recolher cartas ou mudar de página.</p>
        {invalidos && <p className="Estoque-erro">Informe quantidades entre 0 e 99999. O limite é de 500 combinações por lote.</p>}
        {salvar.isError && <p className="Estoque-erro" role="alert">{extrairMensagemErro(salvar.error)}</p>}
      </div>
      <div className="Estoque-lote-acoes"><Botao type="button" variante="fantasma" disabled={ocupado} onClick={() => confirmar(() => { setAjustes({}); salvar.reset(); })}>Descartar ajustes</Botao>
        <Botao type="button" variante="primario" icone={<Save size={16} />} disabled={invalidos || !itens.length || ocupado} onClick={salvarTudo}>{salvar.isPending ? 'Salvando…' : 'Salvar alterações'}</Botao>
      </div>
    </section>}
    {modal}
  </EstruturaGestao>;
}
