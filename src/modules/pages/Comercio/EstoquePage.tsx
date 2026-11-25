import { type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Boxes, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { clienteApi } from '@/app/config/apiConfig';
import { Botao } from '@/shared/components/Botao/Botao';
import { extrairMensagemErro } from '@/modules/pages/Catalogos/api/catalogosApi';
import { useListarFiltrosCartas, useObterCarta, type FiltroOpcao } from '@/modules/pages/Cartas/api/cartasApi';
import { EstruturaGestao, EstadoGestao } from './components/EstruturaGestao';
import './EstoquePage.css';

interface Resposta<T> { success: boolean; message: string; data: T }
interface PropriedadeEstoque { grupo: string; valor: string; valorId: number | null; imagemUrl?: string | null }
interface LinhaEstoque {
  id: number;
  cartasId: number;
  cartaNome: string;
  imagemUrl: string | null;
  tipo: number;
  propriedades: PropriedadeEstoque[];
  quantidade: number;
}
interface PaginaEstoque {
  itens: LinhaEstoque[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalPaginas: number;
}
interface CartaOpcao {
  id: number;
  nome: string;
  nomeImpresso: string;
  imagemUrl?: string | null;
  tipo: number;
}
interface LancamentoEstoque {
  cartasId: number;
  propriedades: Array<Omit<PropriedadeEstoque, 'imagemUrl'>>;
  quantidade: number;
}
interface GrupoPropriedades { grupo: string; titulo: string; opcoes: PropriedadeEstoque[] }

const tipoCarta = (tipo: number) => tipo === 1 ? 'Library' : tipo === 2 ? 'Cripta' : 'Comercial';
const rotulosGrupo: Record<string, string> = {
  tipo: 'Tipo', categoria: 'Categoria', origem: 'Origem', subcategoria: 'Subcategoria',
  tipocarta: 'Tipo de carta', cla: 'Clã', disciplina: 'Disciplina', idioma: 'Idioma',
  estado: 'Estado', precon: 'Precon', sect: 'Sect', set: 'Set', artista: 'Artista',
  titulo: 'Título', trait: 'Trait', grupo: 'Grupo', capacidade: 'Capacidade', votos: 'Votos',
  custosangue: 'Custo de sangue', custopool: 'Custo de pool', primeiraimpressao: 'First Print', reimpressao: 'Reprint',
};
const chavePropriedade = (p: PropriedadeEstoque) => `${p.grupo}:${p.valorId ?? p.valor.toLocaleLowerCase('pt-BR')}`;

function valoresCatalogo(grupo: string, ids: number[], opcoes: FiltroOpcao[]): PropriedadeEstoque[] {
  return ids.map((id) => {
    const opcao = opcoes.find((item) => item.id === id);
    return { grupo, valor: opcao?.nome ?? String(id), valorId: id, imagemUrl: opcao?.imagemUrl };
  });
}

function valoresTexto(grupo: string, valores: Array<string | number | null | undefined>): PropriedadeEstoque[] {
  return valores.filter((valor) => valor !== null && valor !== undefined && String(valor).trim() !== '')
    .map((valor) => ({ grupo, valor: String(valor), valorId: null }));
}

export function EstoquePage() {
  const cache = useQueryClient();
  const [termoCarta, setTermoCarta] = useState('');
  const [buscaLinhas, setBuscaLinhas] = useState('');
  const [buscaLinhasDebounced, setBuscaLinhasDebounced] = useState('');
  const [paginaSaldo, setPaginaSaldo] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(20);
  const [buscaCarta, setBuscaCarta] = useState('');
  const [buscaCartaDebounced, setBuscaCartaDebounced] = useState('');
  const [opcaoCartaAtiva, setOpcaoCartaAtiva] = useState(-1);
  const [cartaId, setCartaId] = useState(0);
  const [cartaSelecionada, setCartaSelecionada] = useState<CartaOpcao | null>(null);
  const [propriedades, setPropriedades] = useState<PropriedadeEstoque[]>([]);
  const [quantidade, setQuantidade] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const buscaCartaRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const temporizador = window.setTimeout(() => setBuscaLinhasDebounced(buscaLinhas.trim()), 300);
    return () => window.clearTimeout(temporizador);
  }, [buscaLinhas]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => setBuscaCartaDebounced(buscaCarta.trim()), 250);
    return () => window.clearTimeout(temporizador);
  }, [buscaCarta]);

  useEffect(() => {
    const aoClicarFora = (evento: PointerEvent) => {
      if (autocompleteRef.current?.contains(evento.target as Node)) return;
      if (buscaCarta) {
        setBuscaCarta('');
        setBuscaCartaDebounced('');
        setOpcaoCartaAtiva(-1);
      }
    };
    document.addEventListener('pointerdown', aoClicarFora);
    return () => document.removeEventListener('pointerdown', aoClicarFora);
  }, [buscaCarta]);

  const linhas = useQuery({
    queryKey: ['admin', 'estoque', 'propriedades', paginaSaldo, tamanhoPagina, buscaLinhasDebounced],
    queryFn: async () => {
      const parametros = new URLSearchParams({ pagina: String(paginaSaldo), tamanhoPagina: String(tamanhoPagina) });
      if (buscaLinhasDebounced) parametros.set('termo', buscaLinhasDebounced);
      return (await clienteApi.get<Resposta<PaginaEstoque>>(`/admin/estoque?${parametros}`)).data.data;
    },
  });
  const opcoes = useListarFiltrosCartas();
  const cartasBusca = useQuery({
    queryKey: ['admin', 'estoque', 'buscar-cartas', buscaCartaDebounced],
    enabled: buscaCartaDebounced.length >= 2 && !cartaSelecionada,
    queryFn: async () => {
      const parametros = new URLSearchParams({ Termo: buscaCartaDebounced, Pagina: '1', TamanhoPagina: '20' });
      return (await clienteApi.get<Resposta<{ cartas: CartaOpcao[] }>>(`/cartas?${parametros}`)).data.data.cartas;
    },
  });
  useEffect(() => {
    if (opcaoCartaAtiva < 0) return;
    const cartaAtiva = cartasBusca.data?.[opcaoCartaAtiva];
    if (cartaAtiva) document.getElementById(`Estoque-carta-opcao-${cartaAtiva.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [opcaoCartaAtiva, cartasBusca.data]);
  const detalheCarta = useObterCarta(cartaId || undefined);
  const salvar = useMutation({
    mutationFn: async (payload: LancamentoEstoque) =>
      (await clienteApi.put<Resposta<LinhaEstoque>>('/admin/estoque', payload)).data.data,
    onSuccess: async () => {
      await Promise.all([
        cache.invalidateQueries({ queryKey: ['admin', 'estoque'] }),
        cache.invalidateQueries({ queryKey: ['admin', 'cartas'] }),
        cache.invalidateQueries({ queryKey: ['cartas'] }),
      ]);
      setCartaSelecionada(null);
      setCartaId(0);
      setBuscaCarta('');
      setBuscaCartaDebounced('');
      setOpcaoCartaAtiva(-1);
      setPropriedades([]);
      setQuantidade('');
      setEditandoId(null);
      window.requestAnimationFrame(() => {
        buscaCartaRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        buscaCartaRef.current?.focus({ preventScroll: true });
      });
    },
  });

  const gruposPropriedades = useMemo<GrupoPropriedades[]>(() => {
    const carta = detalheCarta.data;
    const filtros = opcoes.data;
    if (!carta || !filtros) return [];
    const grupos: GrupoPropriedades[] = [
      { grupo: 'tipo', titulo: 'Tipo de carta (Cripta / Library / Comercial)', opcoes: valoresTexto('tipo', [tipoCarta(carta.tipo)]) },
      { grupo: 'categoria', titulo: 'Categoria', opcoes: valoresTexto('categoria', [carta.categoria]) },
      { grupo: 'origem', titulo: 'Origem', opcoes: valoresTexto('origem', [carta.origem]) },
      { grupo: 'subcategoria', titulo: 'Subcategoria', opcoes: valoresTexto('subcategoria', [carta.subcategoria]) },
      { grupo: 'tipocarta', titulo: 'Tipos de carta', opcoes: valoresCatalogo('tipocarta', carta.tiposCartaIds, filtros.tiposCarta) },
      { grupo: 'cla', titulo: 'Clãs / Paths', opcoes: valoresCatalogo('cla', carta.clasIds, filtros.clas) },
      { grupo: 'disciplina', titulo: 'Disciplinas', opcoes: valoresCatalogo('disciplina', carta.disciplinasIds, filtros.disciplinas) },
      { grupo: 'idioma', titulo: 'Idiomas', opcoes: filtros.idiomas.map((i) => ({ grupo: 'idioma', valor: i.nome, valorId: i.id })) },
      { grupo: 'estado', titulo: 'Estados físicos', opcoes: filtros.estados.map((e) => ({ grupo: 'estado', valor: e.nome, valorId: e.id })) },
      { grupo: 'precon', titulo: 'Precons', opcoes: valoresCatalogo('precon', carta.preconsIds, filtros.precons) },
      { grupo: 'sect', titulo: 'Sect', opcoes: valoresTexto('sect', [carta.sect]) },
      { grupo: 'set', titulo: 'Set / edição', opcoes: valoresTexto('set', [carta.edicao]) },
      { grupo: 'artista', titulo: 'Artista', opcoes: valoresTexto('artista', [carta.artista]) },
      { grupo: 'titulo', titulo: 'Títulos', opcoes: valoresTexto('titulo', carta.titulos) },
      { grupo: 'trait', titulo: 'Traits', opcoes: valoresTexto('trait', carta.traits) },
      { grupo: 'grupo', titulo: 'Grupo', opcoes: valoresTexto('grupo', [carta.grupo]) },
      { grupo: 'capacidade', titulo: 'Capacidade', opcoes: valoresTexto('capacidade', [carta.capacidade]) },
      { grupo: 'votos', titulo: 'Votos', opcoes: valoresTexto('votos', [carta.votos]) },
      { grupo: 'custosangue', titulo: 'Custo de sangue', opcoes: valoresTexto('custosangue', [carta.custoSangue]) },
      { grupo: 'custopool', titulo: 'Custo de pool', opcoes: valoresTexto('custopool', [carta.custoPool]) },
      { grupo: 'primeiraimpressao', titulo: 'First Print', opcoes: valoresTexto('primeiraimpressao', [carta.primeiraImpressao ? 'Sim' : 'Não']) },
      { grupo: 'reimpressao', titulo: 'Reprint', opcoes: valoresTexto('reimpressao', [carta.reimpressao ? 'Sim' : 'Não']) },
    ];
    const extras = cartaId === carta.id ? propriedades : [];
    for (const propriedade of extras) {
      const grupo = grupos.find((item) => item.grupo === propriedade.grupo);
      if (grupo && !grupo.opcoes.some((opcao) => chavePropriedade(opcao) === chavePropriedade(propriedade)))
        grupo.opcoes.push(propriedade);
    }
    return grupos.filter((grupo) => grupo.opcoes.length > 0);
  }, [detalheCarta.data, opcoes.data, cartaId, propriedades]);

  const linhasVisiveis = useMemo(() => {
    return linhas.data?.itens ?? [];
  }, [linhas.data]);

  const totalPaginas = linhas.data?.totalPaginas ?? 1;

  const selecionarCarta = (carta: CartaOpcao) => {
    setCartaSelecionada(carta);
    setCartaId(carta.id);
    setBuscaCarta('');
    setBuscaCartaDebounced('');
    setOpcaoCartaAtiva(-1);
    setEditandoId(null);
    setPropriedades([]);
    setQuantidade('');
    window.requestAnimationFrame(() => quantidadeRef.current?.focus());
  };

  const limparCartaSelecionada = () => {
    setCartaSelecionada(null);
    setCartaId(0);
    setPropriedades([]);
    setEditandoId(null);
    setQuantidade('');
  };

  const navegarAutocomplete = (evento: KeyboardEvent<HTMLInputElement>) => {
    const buscaAtualizada = buscaCartaDebounced === buscaCarta.trim() && !cartasBusca.isFetching;
    const resultados = buscaAtualizada ? cartasBusca.data ?? [] : [];
    if (evento.key === 'Escape') {
      setBuscaCarta('');
      setBuscaCartaDebounced('');
      setOpcaoCartaAtiva(-1);
      return;
    }
    if (evento.key === 'ArrowDown' && resultados.length > 0) {
      evento.preventDefault();
      setOpcaoCartaAtiva((indice) => indice < 0 || indice >= resultados.length - 1 ? 0 : indice + 1);
    } else if (evento.key === 'ArrowUp' && resultados.length > 0) {
      evento.preventDefault();
      setOpcaoCartaAtiva((indice) => indice <= 0 ? resultados.length - 1 : indice - 1);
    } else if (evento.key === 'Enter' && opcaoCartaAtiva >= 0 && resultados[opcaoCartaAtiva]) {
      evento.preventDefault();
      selecionarCarta(resultados[opcaoCartaAtiva]);
    }
  };

  const editarLinha = (linha: LinhaEstoque) => {
    setCartaId(linha.cartasId);
    setCartaSelecionada({ id: linha.cartasId, nome: linha.cartaNome, nomeImpresso: linha.cartaNome, imagemUrl: linha.imagemUrl, tipo: linha.tipo });
    setBuscaCarta('');
    setPropriedades(linha.propriedades);
    setQuantidade(String(linha.quantidade));
    setEditandoId(linha.id);
    window.requestAnimationFrame(() => quantidadeRef.current?.focus());
  };

  const alternarPropriedade = (propriedade: PropriedadeEstoque) => {
    setPropriedades((atuais) => atuais.some((item) => chavePropriedade(item) === chavePropriedade(propriedade))
      ? atuais.filter((item) => chavePropriedade(item) !== chavePropriedade(propriedade))
      : [...atuais, propriedade]);
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    salvar.reset();
    salvar.mutate({
      cartasId: cartaId,
      propriedades: propriedades.map(({ grupo, valor, valorId }) => ({ grupo, valor, valorId })),
      quantidade: Math.max(0, Math.trunc(Number(quantidade) || 0)),
    });
  };

  const alterarBuscaLinhas = (valor: string) => {
    setBuscaLinhas(valor);
    setPaginaSaldo(1);
  };

  return <EstruturaGestao titulo="Estoque" descricao="Controle os saldos de qualquer carta usando qualquer combinação dos grupos de propriedades disponíveis.">
    <EstadoGestao carregando={linhas.isLoading} erro={linhas.isError} repetir={() => void linhas.refetch()} />
    {!linhas.isLoading && !linhas.isError && <>
      <section className="Comercio-card Estoque-lancamento">
        <header className="Estoque-cabecalho-secao"><div className="Estoque-icone"><Boxes size={18} /></div><div><h2>Lançar estoque</h2><p>Selecione qualquer subconjunto de propriedades. Você também pode registrar uma combinação sem propriedades.</p></div></header>
        <form className="Estoque-formulario" onSubmit={(evento) => void enviar(evento)}>
          <div className="Estoque-linha-principal">
            <div className="Estoque-campo Estoque-campo-autocomplete" ref={autocompleteRef}><span>Buscar carta</span>
            {cartaSelecionada ? <div className="Estoque-carta-selecionada">
              {cartaSelecionada.imagemUrl ? <img src={cartaSelecionada.imagemUrl} alt="" /> : <span className="Estoque-carta-sem-imagem"><Boxes size={17} /></span>}
              <div><strong>{cartaSelecionada.nomeImpresso || cartaSelecionada.nome}</strong><small>{tipoCarta(cartaSelecionada.tipo)}</small></div>
              <button type="button" onClick={limparCartaSelecionada} aria-label="Remover carta selecionada"><X size={16} /></button>
            </div> : <>
              <span className="Estoque-busca"><Search size={15} /><input ref={buscaCartaRef} value={buscaCarta} onKeyDown={navegarAutocomplete} onChange={(evento) => { setBuscaCarta(evento.target.value); setOpcaoCartaAtiva(-1); setCartaId(0); setPropriedades([]); setEditandoId(null); }} placeholder="Digite ao menos 2 letras do nome" role="combobox" aria-expanded={buscaCarta.trim().length >= 2} aria-controls="Estoque-opcoes-cartas" aria-activedescendant={cartasBusca.data?.[opcaoCartaAtiva] ? `Estoque-carta-opcao-${cartasBusca.data[opcaoCartaAtiva].id}` : undefined} aria-autocomplete="list" /></span>
              {buscaCarta.trim().length >= 2 && <div className="Estoque-autocomplete-resultados" id="Estoque-opcoes-cartas" role="listbox">
                {buscaCartaDebounced !== buscaCarta.trim() || cartasBusca.isFetching ? <p>Buscando cartas…</p> : cartasBusca.data?.length ? cartasBusca.data.map((carta, indice) => <button type="button" role="option" id={`Estoque-carta-opcao-${carta.id}`} aria-selected={indice === opcaoCartaAtiva} className={indice === opcaoCartaAtiva ? 'ativo' : undefined} key={carta.id} onClick={() => selecionarCarta(carta)}>
                  {carta.imagemUrl ? <img src={carta.imagemUrl} alt="" loading="lazy" /> : <span className="Estoque-carta-sem-imagem"><Boxes size={16} /></span>}
                  <span><strong>{carta.nomeImpresso || carta.nome}</strong><small>{tipoCarta(Number(carta.tipo))}</small></span>
                </button>) : cartasBusca.isError ? <p>Não foi possível buscar as cartas.</p> : <p>Nenhuma carta encontrada.</p>}
              </div>}
            </>}
            </div>
            <label className="Estoque-campo"><span>Quantidade disponível</span><input ref={quantidadeRef} type="text" inputMode="numeric" pattern="[0-9]{1,5}" maxLength={5} value={quantidade} onChange={(evento) => setQuantidade(evento.target.value.replace(/\D/g, '').slice(0, 5))} /></label>
          </div>
          {cartaId > 0 && detalheCarta.isLoading && <p className="Estoque-carregando-propriedades">Carregando propriedades da carta…</p>}
          {cartaId > 0 && detalheCarta.isError && <p className="Estoque-erro" role="alert">Não foi possível carregar as propriedades da carta.</p>}
          {cartaId > 0 && !detalheCarta.isLoading && <div className="Estoque-grupos-propriedades">
            <h3>Propriedades para esta combinação</h3>
            {gruposPropriedades.map((grupo) => <fieldset className="Estoque-grupo-propriedades" key={grupo.grupo}>
              <legend>{grupo.titulo}</legend>
              <div>{grupo.opcoes.map((opcao) => <label key={chavePropriedade(opcao)}>
                <input type="checkbox" checked={propriedades.some((item) => chavePropriedade(item) === chavePropriedade(opcao))} onChange={() => alternarPropriedade(opcao)} />
                {opcao.imagemUrl && <img className="Estoque-imagem-propriedade" src={opcao.imagemUrl} alt="" loading="lazy" />}
                <span>{opcao.valor}</span>
              </label>)}</div>
            </fieldset>)}
            <div className="Estoque-propriedades-selecionadas"><span>Combinação selecionada</span>
              {propriedades.length === 0 ? <em>Sem propriedades</em> : propriedades.map((item) => <button type="button" key={chavePropriedade(item)} onClick={() => alternarPropriedade(item)} title="Remover propriedade">
                {rotulosGrupo[item.grupo] ?? item.grupo}: {item.valor}<X size={13} />
              </button>)}
            </div>
          </div>}
          {salvar.isError && <p className="Estoque-erro" role="alert">{extrairMensagemErro(salvar.error)}</p>}
          <div className="Estoque-acoes"><Botao type="submit" disabled={!cartaId || (quantidade !== '' && !/^\d{1,5}$/.test(quantidade)) || detalheCarta.isLoading || salvar.isPending}>{salvar.isPending ? 'Salvando…' : editandoId ? 'Atualizar combinação' : 'Salvar combinação'}</Botao></div>
        </form>
      </section>

      <section className="Comercio-card Estoque-lista">
        <div className="Estoque-lista-cabecalho"><div><h2>Saldos por propriedade</h2><p>{linhas.data?.total ?? 0} combinações encontradas</p></div><input aria-label="Filtrar saldos" placeholder="Filtrar por carta ou propriedade" value={buscaLinhas} onChange={(evento) => alterarBuscaLinhas(evento.target.value)} /></div>
        {linhasVisiveis.length === 0 ? <p className="Estoque-vazio">{buscaLinhas.trim() ? 'Nenhum saldo encontrado para essa busca.' : 'Nenhum saldo encontrado. Escolha uma carta acima para lançar o primeiro.'}</p> : <div className="Comercio-tabela-container"><table className="Comercio-tabela"><thead><tr><th>Carta</th><th>Tipo</th><th>Propriedades</th><th>Quantidade</th><th>Ações</th></tr></thead><tbody>
          {linhasVisiveis.map((linha) => <tr key={linha.id}>
            <td><div className="Estoque-carta">{linha.imagemUrl ? <img src={linha.imagemUrl} alt="" loading="lazy" /> : <span><Boxes size={16} /></span>}<strong>{linha.cartaNome}</strong></div></td>
            <td>{tipoCarta(linha.tipo)}</td>
            <td>{linha.propriedades.length === 0 ? <em>Sem propriedades</em> : <div className="Estoque-propriedades-tabela">{linha.propriedades.map((p) => <span key={chavePropriedade(p)}>{rotulosGrupo[p.grupo] ?? p.grupo}: {p.valor}</span>)}</div>}</td>
            <td><strong>{linha.quantidade}</strong></td>
            <td><Botao variante="fantasma" onClick={() => editarLinha(linha)}>Editar</Botao></td>
          </tr>)}
        </tbody></table></div>}
        {(linhas.data?.total ?? 0) > 0 && <div className="Estoque-paginacao">
          <label>Por página <select value={tamanhoPagina} onChange={(evento) => { setTamanhoPagina(Number(evento.target.value)); setPaginaSaldo(1); }}><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></label>
          <div><button type="button" onClick={() => setPaginaSaldo((pagina) => Math.max(1, pagina - 1))} disabled={paginaSaldo <= 1} aria-label="Página anterior"><ChevronLeft size={17} /></button><span>Página {linhas.data?.pagina ?? paginaSaldo} de {totalPaginas}</span><button type="button" onClick={() => setPaginaSaldo((pagina) => Math.min(totalPaginas, pagina + 1))} disabled={paginaSaldo >= totalPaginas} aria-label="Próxima página"><ChevronRight size={17} /></button></div>
        </div>}
      </section>
    </>}
  </EstruturaGestao>;
}
