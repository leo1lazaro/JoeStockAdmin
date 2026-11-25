import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Image as IconeImagem, ImageUp, Plus, Skull, BookOpen, Package } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Botao } from '@/shared/components/Botao/Botao';
import { InputNumero } from '@/shared/components/InputNumero/InputNumero';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '@/app/config/apiConfig';
import { enviarImagemCatalogo, extrairMensagemErro } from '@/modules/pages/Catalogos/api/catalogosApi';
import { Modal } from '@/shared/components/Modal/Modal';
import { Select } from '@/shared/components/Select/Select';
import {
  CartaPayload,
  CartasFiltros,
  FiltroOpcao,
  useAtualizarCarta,
  useCriarCarta,
  useListarFiltrosCartas,
  useObterCarta,
} from '../api/cartasApi';
import { SeletorMultiplo } from '../components/SeletorMultiplo/SeletorMultiplo';
import '@/modules/pages/Catalogos/components/CatalogoPage/CatalogoPage.css';
import './CartaFormPage.css';

const TIPO_LIBRARY = 1;
const TIPO_CRIPTA = 2;
const TIPO_COMERCIAL = 3;

type CampoCadastroRapido = 'tiposCartaIds' | 'clasIds' | 'disciplinasIds' | 'idiomasIds' | 'estadosIds' | 'preconsIds';
type RecursoCatalogo = 'tipos-carta' | 'clas' | 'disciplinas' | 'idiomas' | 'estados' | 'precons';
interface ItemCatalogoRapido extends FiltroOpcao {}

const configuracaoCadastroRapido: Record<CampoCadastroRapido, { recurso: RecursoCatalogo; chaveFiltro: keyof CartasFiltros; titulo: string; aceitaImagem: boolean }> = {
  tiposCartaIds: { recurso: 'tipos-carta', chaveFiltro: 'tiposCarta', titulo: 'tipo de carta', aceitaImagem: true },
  clasIds: { recurso: 'clas', chaveFiltro: 'clas', titulo: 'clã', aceitaImagem: true },
  disciplinasIds: { recurso: 'disciplinas', chaveFiltro: 'disciplinas', titulo: 'disciplina', aceitaImagem: true },
  idiomasIds: { recurso: 'idiomas', chaveFiltro: 'idiomas', titulo: 'idioma', aceitaImagem: false },
  estadosIds: { recurso: 'estados', chaveFiltro: 'estados', titulo: 'estado', aceitaImagem: false },
  preconsIds: { recurso: 'precons', chaveFiltro: 'precons', titulo: 'precon', aceitaImagem: true },
};

interface ValoresCarta {
  tipo: number;
  nome: string;
  nomeImpresso: string;
  textoCarta: string;
  imagemUrl: string;
  versao: string;
  categoria: string;
  origem: string;
  subcategoria: string;
  preco: string;
  ativo: boolean;
  sect: string;
  artista: string;
  preconsIds: number[];
  primeiraImpressao: boolean;
  reimpressao: boolean;
  titulos: string;
  traits: string;
  tiposCartaIds: number[];
  clasIds: number[];
  disciplinasIds: number[];
  idiomasIds: number[];
  estadosIds: number[];
  capacidade: string;
  edicao: string;
  edicaoOrdem: string;
  grupo: string;
  votos: string;
  custoTipo: 'nenhum' | 'sangue' | 'pool';
  custo: string;
  acaoDirecionada: boolean;
  textoRequisito: string;
}

const VALORES_INICIAIS: ValoresCarta = {
  tipo: 0,
  nome: '',
  nomeImpresso: '',
  textoCarta: '',
  imagemUrl: '',
  versao: '',
  categoria: 'single',
  origem: 'nacional',
  subcategoria: 'outros',
  preco: '',
  ativo: false,
  sect: '',
  artista: '',
  preconsIds: [],
  primeiraImpressao: false,
  reimpressao: false,
  titulos: '',
  traits: '',
  tiposCartaIds: [],
  clasIds: [],
  disciplinasIds: [],
  idiomasIds: [],
  estadosIds: [],
  capacidade: '',
  edicao: '',
  edicaoOrdem: '',
  grupo: '',
  votos: '',
  custoTipo: 'nenhum',
  custo: '',
  acaoDirecionada: false,
  textoRequisito: '',
};

const inteiroOuNulo = (texto: string) => (texto.trim() === '' ? null : Number(texto));

export const CartaFormPage: React.FC = () => {
  const navegar = useNavigate();
  const toast = useNotificacaoToast();
  const criar = useCriarCarta();
  const atualizarCarta = useAtualizarCarta();
  const location = useLocation();
  const idCarta = (location.state as { id?: number } | null)?.id;
  const editandoRota = location.pathname.endsWith('/editar');
  const editando = !!idCarta;
  const { data: cartaExistente, isLoading: carregandoCarta, isError: erroCarta } = useObterCarta(idCarta);
  const [valores, setValores] = useState<ValoresCarta>(VALORES_INICIAIS);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [imagemQuebrada, setImagemQuebrada] = useState(false);
  const [cadastroRapido, setCadastroRapido] = useState<CampoCadastroRapido | null>(null);
  const [nomeRapido, setNomeRapido] = useState('');
  const [siglaRapida, setSiglaRapida] = useState('');
  const [imagemUrlRapida, setImagemUrlRapida] = useState('');
  const [somenteCriptaRapido, setSomenteCriptaRapido] = useState(false);
  const [somenteLibraryRapido, setSomenteLibraryRapido] = useState(false);
  const [erroCadastroRapido, setErroCadastroRapido] = useState<string | null>(null);
  const [enviandoImagemRapida, setEnviandoImagemRapida] = useState(false);
  const queryClient = useQueryClient();

  const criarCatalogoRapido = useMutation({
    mutationFn: async ({ recurso, payload }: { recurso: RecursoCatalogo; payload: Record<string, unknown> }) => {
      const resposta = await clienteApi.post<{ data: ItemCatalogoRapido }>(`/admin/${recurso}`, payload);
      return resposta.data.data;
    },
    onSuccess: (item, variaveis) => {
      const configuracao = Object.values(configuracaoCadastroRapido).find((valor) => valor.recurso === variaveis.recurso)!;
      queryClient.setQueryData<CartasFiltros>(['cartas', 'filtros'], (atual) => atual ? {
        ...atual,
        [configuracao.chaveFiltro]: [...(atual[configuracao.chaveFiltro] as FiltroOpcao[]), item].sort((a, b) => a.nome.localeCompare(b.nome)),
      } : atual);
      void queryClient.invalidateQueries({ queryKey: ['cartas', 'filtros'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'catalogo', variaveis.recurso] });
    },
    meta: { desativarNotificacao: true },
  });

  useEffect(() => {
    if (!cartaExistente) return;
    const c = cartaExistente;
    setValores({
      tipo: c.tipo,
      nome: c.nome,
      nomeImpresso: c.nomeImpresso && c.nomeImpresso !== c.nome ? c.nomeImpresso : '',
      textoCarta: c.textoCarta,
      imagemUrl: c.imagemUrl ?? '',
      versao: c.versao,
      categoria: c.categoria,
      origem: c.origem,
      subcategoria: c.subcategoria,
      preco: c.preco == null ? '' : String(c.preco),
      ativo: c.ativo,
      sect: c.sect ?? '',
      artista: c.artista ?? '',
      preconsIds: c.preconsIds ?? [],
      primeiraImpressao: c.primeiraImpressao,
      reimpressao: c.reimpressao,
      titulos: c.titulos.join(', '),
      traits: c.traits.join(', '),
      tiposCartaIds: c.tiposCartaIds,
      clasIds: c.clasIds,
      disciplinasIds: c.disciplinasIds,
      idiomasIds: c.idiomasIds,
      estadosIds: c.estadosIds,
      capacidade: c.capacidade != null ? String(c.capacidade) : '',
      edicao: c.edicao ?? '',
      edicaoOrdem: c.edicaoOrdem != null ? String(c.edicaoOrdem) : '',
      grupo: c.grupo != null ? String(c.grupo) : '',
      votos: c.votos != null ? String(c.votos) : '',
      custoTipo: c.custoSangue ? 'sangue' : c.custoPool ? 'pool' : 'nenhum',
      custo: String(c.custoSangue || c.custoPool || ''),
      acaoDirecionada: c.acaoDirecionada,
      textoRequisito: c.textoRequisito ?? '',
    });
  }, [cartaExistente]);

  const { data: opcoes } = useListarFiltrosCartas();

  const ehCripta = valores.tipo === TIPO_CRIPTA;
  const ehComercial = valores.tipo === TIPO_COMERCIAL;
  const tipoEscolhido = valores.tipo !== 0;

  const atualizar = <K extends keyof ValoresCarta>(campo: K, valor: ValoresCarta[K]) => {
    setValores((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: '' }));
    if (campo === 'imagemUrl') setImagemQuebrada(false);
  };

  const escolherTipo = (tipo: number) =>
    setValores((atual) => ({ ...atual, tipo, tiposCartaIds: [] }));

  const abrirCadastroRapido = (campo: CampoCadastroRapido) => {
    setCadastroRapido(campo);
    setNomeRapido('');
    setSiglaRapida('');
    setImagemUrlRapida('');
    setSomenteCriptaRapido(false);
    setSomenteLibraryRapido(false);
    setErroCadastroRapido(null);
  };

  const fecharCadastroRapido = () => {
    if (criarCatalogoRapido.isPending || enviandoImagemRapida) return;
    setCadastroRapido(null);
    setErroCadastroRapido(null);
  };

  const enviarImagemRapida = async (arquivo?: File) => {
    if (!arquivo) return;
    setErroCadastroRapido(null);
    setEnviandoImagemRapida(true);
    try {
      setImagemUrlRapida(await enviarImagemCatalogo(arquivo));
    } catch (erro) {
      setErroCadastroRapido(extrairMensagemErro(erro));
    } finally {
      setEnviandoImagemRapida(false);
    }
  };

  const salvarCadastroRapido = async () => {
    if (!cadastroRapido || !nomeRapido.trim()) return;
    setErroCadastroRapido(null);
    if (cadastroRapido === 'estadosIds' && !siglaRapida.trim()) {
      setErroCadastroRapido('Informe a sigla do estado.');
      return;
    }
    const { recurso } = configuracaoCadastroRapido[cadastroRapido];
    const payload: Record<string, unknown> = { nome: nomeRapido.trim() };
    if (recurso === 'tipos-carta') {
      payload.somenteCripta = somenteCriptaRapido;
      payload.somenteLibrary = somenteLibraryRapido;
    }
    if (recurso === 'estados') {
      payload.sigla = siglaRapida.trim().toUpperCase();
    }
    if (configuracaoCadastroRapido[cadastroRapido].aceitaImagem) payload.imagemUrl = imagemUrlRapida.trim() || null;

    try {
      const item = await criarCatalogoRapido.mutateAsync({ recurso, payload });
      switch (cadastroRapido) {
        case 'tiposCartaIds': atualizar('tiposCartaIds', [...valores.tiposCartaIds, item.id]); break;
        case 'clasIds': atualizar('clasIds', [...valores.clasIds, item.id]); break;
        case 'disciplinasIds': atualizar('disciplinasIds', [...valores.disciplinasIds, item.id]); break;
        case 'idiomasIds': atualizar('idiomasIds', [...valores.idiomasIds, item.id]); break;
        case 'estadosIds': atualizar('estadosIds', [...valores.estadosIds, item.id]); break;
        case 'preconsIds': atualizar('preconsIds', [...valores.preconsIds, item.id]); break;
      }
      toast.sucesso(`Cadastro de ${configuracaoCadastroRapido[cadastroRapido].titulo} criado e selecionado.`);
      setCadastroRapido(null);
    } catch (erro) {
      setErroCadastroRapido(extrairMensagemErro(erro));
    }
  };

  const idsOpcoes = useMemo(() => new Set((opcoes?.tiposCarta ?? []).map((t) => t.id)), [opcoes?.tiposCarta]);

  const validar = () => {
    const novos: Record<string, string> = {};
    if (!valores.nome.trim()) novos.nome = 'Informe o nome da carta.';
    if (!valores.textoCarta.trim()) novos.textoCarta = 'Informe o texto da carta.';
    if (ehComercial) {
      if (!Number.isFinite(Number(valores.preco)) || Number(valores.preco) <= 0)
        novos.preco = 'Informe um preço maior que zero.';
    } else if (ehCripta) {
      const capacidade = Number(valores.capacidade);
      if (!valores.capacidade || !Number.isInteger(capacidade) || capacidade < 1 || capacidade > 11)
        novos.capacidade = 'Informe a capacidade (de 1 a 11).';
    } else if (valores.custoTipo !== 'nenhum' && !(Number(valores.custo) > 0)) {
      novos.custo = 'Informe um custo maior que zero.';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const salvar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!tipoEscolhido) {
      toast.erro('Escolha primeiro o tipo da carta.');
      return;
    }
    if (!validar()) return;

    const payload: CartaPayload = {
      tipo: valores.tipo,
      nome: valores.nome,
      nomeImpresso: valores.nomeImpresso || null,
      textoCarta: valores.textoCarta,
      imagemUrl: valores.imagemUrl || null,
      versao: editando ? valores.versao : null,
      categoria: valores.categoria,
      origem: valores.origem,
      subcategoria: valores.subcategoria,
      preco: valores.preco ? Number(valores.preco) : null,
      ativo: valores.ativo,
      tiposCartaIds: valores.tiposCartaIds.filter((id) => idsOpcoes.has(id)),
      clasIds: valores.clasIds,
      disciplinasIds: valores.disciplinasIds,
      idiomasIds: valores.idiomasIds,
      estadosIds: valores.estadosIds,
      sect: valores.sect || null,
      edicao: valores.edicao || null,
      edicaoOrdem: inteiroOuNulo(valores.edicaoOrdem),
      artista: valores.artista || null,
      preconsIds: valores.preconsIds,
      primeiraImpressao: valores.primeiraImpressao,
      reimpressao: valores.reimpressao,
      titulos: valores.titulos.split(',').map((valor) => valor.trim()).filter(Boolean),
      traits: valores.traits.split(',').map((valor) => valor.trim()).filter(Boolean),
      acaoDirecionada: !ehCripta && !ehComercial && valores.acaoDirecionada,
      capacidade: ehCripta ? Number(valores.capacidade) : null,
      grupo: ehCripta ? inteiroOuNulo(valores.grupo) : null,
      votos: ehCripta ? inteiroOuNulo(valores.votos) : null,
      custoSangue: !ehCripta && valores.custoTipo === 'sangue' ? Number(valores.custo) : null,
      custoPool: !ehCripta && valores.custoTipo === 'pool' ? Number(valores.custo) : null,
      textoRequisito: !ehCripta ? valores.textoRequisito || null : null,
    };

    try {
      const resposta = editando
        ? await atualizarCarta.mutateAsync({ id: idCarta!, payload })
        : await criar.mutateAsync(payload);
      toast.sucesso(resposta.message);
      navegar('/admin/cartas');
    } catch (erro) {
      toast.erro(extrairMensagemErro(erro));
    }
  };

  if (editandoRota && !idCarta) return <Navigate to="/admin/cartas" replace />;

  if (editando && carregandoCarta)
    return (
      <div className="pagina-catalogo">
        <div className="catalogo-estado">Carregando carta...</div>
      </div>
    );

  if (editando && erroCarta)
    return (
      <div className="pagina-catalogo">
        <div className="catalogo-estado catalogo-estado-erro">
          Não foi possível carregar a carta.
          <Botao onClick={() => navegar('/admin/cartas')}>Voltar</Botao>
        </div>
      </div>
    );

  const salvando = criar.isPending || atualizarCarta.isPending;

  const campoErro = (nome: string) => (erros[nome] ? <small className="carta-form-erro">{erros[nome]}</small> : null);
  const botaoCadastroRapido = (campo: CampoCadastroRapido) => (
    <button type="button" className="carta-form-cadastro-rapido" onClick={() => abrirCadastroRapido(campo)}>
      <Plus size={14} /> Cadastro rápido
    </button>
  );

  return (
    <>
    <form className="pagina-catalogo carta-form" onSubmit={salvar} noValidate>
      <div className="pagina-catalogo-cabecalho">
        <div className="pagina-catalogo-titulo-bloco">
          <button type="button" className="catalogo-btn-acao" onClick={() => navegar('/admin/cartas')} aria-label="Voltar">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="pagina-catalogo-titulo">{editando ? 'Editar carta' : 'Nova carta'}</h2>
            <p className="pagina-catalogo-descricao">Preencha os dados abaixo. Os campos com * são obrigatórios.</p>
          </div>
        </div>
      </div>

      <section className="card-catalogo carta-form-secao">
        <header>
          <span className="carta-form-passo">1</span>
          <div>
            <h3>{editando ? 'Tipo da carta' : 'Que tipo de carta é?'}</h3>
            <p>{editando ? 'O tipo não pode ser alterado depois do cadastro.' : 'Isso define quais campos aparecem a seguir.'}</p>
          </div>
        </header>
        <div className="carta-form-tipos">
          <button
            type="button"
            className={`carta-form-tipo ${valores.tipo === TIPO_LIBRARY ? 'ativo' : ''}`}
            onClick={() => escolherTipo(TIPO_LIBRARY)}
            disabled={editando}
          >
            <BookOpen size={22} />
            <strong>Library</strong>
            <span>Ações, equipamentos, aliados, reações, eventos...</span>
          </button>
          <button
            type="button"
            className={`carta-form-tipo ${valores.tipo === TIPO_CRIPTA ? 'ativo' : ''}`}
            onClick={() => escolherTipo(TIPO_CRIPTA)}
            disabled={editando}
          >
            <Skull size={22} />
            <strong>Cripta</strong>
            <span>Vampiros e imbuídos, com capacidade e grupo.</span>
          </button>
          <button
            type="button"
            className={`carta-form-tipo ${valores.tipo === TIPO_COMERCIAL ? 'ativo' : ''}`}
            onClick={() => escolherTipo(TIPO_COMERCIAL)}
            disabled={editando}
          >
            <Package size={22} />
            <strong>Comercial</strong>
            <span>Selados e acessórios cadastrados junto às cartas.</span>
          </button>
        </div>
      </section>

      {tipoEscolhido && (
        <>
          <section className="card-catalogo carta-form-secao">
            <header>
              <span className="carta-form-passo">2</span>
              <div>
                <h3>Informações da carta</h3>
                <p>Nome, texto e imagem exibidos no catálogo.</p>
              </div>
            </header>

            <div className="carta-form-grade">
              <div className="carta-form-coluna">
                <label className="catalogo-campo">
                  <span>Nome *</span>
                  <input
                    value={valores.nome}
                    maxLength={200}
                    placeholder="Ex.: Aabbt Kindred"
                    onChange={(e) => atualizar('nome', e.target.value)}
                  />
                  {campoErro('nome')}
                </label>

                <label className="catalogo-campo">
                  <span>Nome impresso</span>
                  <input
                    value={valores.nomeImpresso}
                    maxLength={200}
                    placeholder="Deixe em branco para usar o mesmo nome"
                    onChange={(e) => atualizar('nomeImpresso', e.target.value)}
                  />
                </label>

                <label className="catalogo-campo">
                  <span>{ehComercial ? 'Descrição *' : 'Texto da carta *'}</span>
                  <textarea
                    className="carta-form-texto"
                    rows={6}
                    value={valores.textoCarta}
                    placeholder={ehComercial ? 'Descrição da carta comercial' : 'Texto de regras exatamente como na carta'}
                    onChange={(e) => atualizar('textoCarta', e.target.value)}
                  />
                  {campoErro('textoCarta')}
                </label>
              </div>

              <div className="carta-form-coluna">
                <label className="catalogo-campo">
                  <span>URL da imagem</span>
                  <input
                    value={valores.imagemUrl}
                    maxLength={500}
                    placeholder="https://..."
                    onChange={(e) => atualizar('imagemUrl', e.target.value)}
                  />
                </label>
                <div className="carta-form-previa">
                  {valores.imagemUrl && !imagemQuebrada ? (
                    <img src={valores.imagemUrl} alt="Prévia da carta" onError={() => setImagemQuebrada(true)} />
                  ) : (
                    <div className="carta-form-previa-vazia">
                      <IconeImagem size={28} />
                      <span>{imagemQuebrada ? 'Não foi possível carregar a imagem' : 'A prévia aparece aqui'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="card-catalogo carta-form-secao">
            <header>
              <span className="carta-form-passo">3</span>
              <div>
                <h3>{ehComercial ? 'Dados comerciais' : ehCripta ? 'Dados da cripta' : 'Dados da library'}</h3>
                <p>{ehComercial ? 'Preço e categoria da carta comercial.' : ehCripta ? 'Informações exclusivas de cartas de cripta.' : 'Custo e requisitos para jogar a carta.'}</p>
              </div>
            </header>

            {ehComercial ? (
              <div className="carta-form-coluna">
                <div className="carta-form-linha">
                  <label className="catalogo-campo">
                    <span>Categoria</span>
                    <Select
                      rotuloAcessivel="Categoria"
                      valor={valores.categoria}
                      opcoes={[{ valor: 'selado', rotulo: 'Selado' }, { valor: 'acessorio', rotulo: 'Acessório' }]}
                      aoAlterar={(valor) => atualizar('categoria', valor)}
                    />
                  </label>
                  <label className="catalogo-campo">
                    <span>Origem</span>
                    <Select
                      rotuloAcessivel="Origem"
                      valor={valores.origem}
                      opcoes={[{ valor: 'nacional', rotulo: 'Nacional' }, { valor: 'importado', rotulo: 'Importado' }]}
                      aoAlterar={(valor) => atualizar('origem', valor)}
                    />
                  </label>
                </div>
                {valores.categoria === 'selado' && <label className="catalogo-campo">
                  <span>Tipo de selado</span>
                  <select value={valores.subcategoria} onChange={(e) => atualizar('subcategoria', e.target.value)}>
                    <option value="decks">Decks</option><option value="new-bloods">New Bloods</option><option value="bundles">Bundles</option><option value="outros">Outros</option>
                  </select>
                </label>}
              </div>
            ) : ehCripta ? (
              <div className="carta-form-linha">
                <label className="catalogo-campo">
                  <span>Capacidade *</span>
                  <InputNumero
                    min={1}
                    max={11}
                    valor={valores.capacidade}
                    placeholder="1 a 11"
                    aoAlterar={(v) => atualizar('capacidade', v)}
                  />
                  {campoErro('capacidade')}
                </label>
                <label className="catalogo-campo">
                  <span>Grupo</span>
                  <InputNumero
                    min={1}
                    valor={valores.grupo}
                    placeholder="Ex.: 2"
                    aoAlterar={(v) => atualizar('grupo', v)}
                  />
                </label>
                <label className="catalogo-campo">
                  <span>Votos</span>
                  <InputNumero min={0} max={4} valor={valores.votos} placeholder="0 a 4" aoAlterar={(v) => atualizar('votos', v)} />
                </label>
              </div>
            ) : (
              <div className="carta-form-coluna">
                <div className="catalogo-campo">
                  <span>Custo</span>
                  <div className="carta-form-custo">
                    {(['nenhum', 'sangue', 'pool'] as const).map((opcao) => (
                      <button
                        key={opcao}
                        type="button"
                        className={`seletor-multiplo-chip ${valores.custoTipo === opcao ? 'ativo' : ''}`}
                        aria-pressed={valores.custoTipo === opcao}
                        onClick={() => atualizar('custoTipo', opcao)}
                      >
                        {valores.custoTipo === opcao && <Check size={13} />}
                        {opcao === 'nenhum' ? 'Sem custo' : opcao === 'sangue' ? 'Sangue' : 'Pool'}
                      </button>
                    ))}
                    {valores.custoTipo !== 'nenhum' && (
                      <InputNumero
                        className="carta-form-custo-valor"
                        min={1}
                        valor={valores.custo}
                        placeholder="Valor"
                        aoAlterar={(v) => atualizar('custo', v)}
                      />
                    )}
                  </div>
                  {campoErro('custo')}
                </div>

                <label className="catalogo-campo">
                  <span>Requisito</span>
                  <input
                    value={valores.textoRequisito}
                    maxLength={500}
                    placeholder="Ex.: Requer um Tremere"
                    onChange={(e) => atualizar('textoRequisito', e.target.value)}
                  />
                </label>

                <label className="catalogo-campo-caixa">
                  <input
                    type="checkbox"
                    checked={valores.acaoDirecionada}
                    onChange={(e) => atualizar('acaoDirecionada', e.target.checked)}
                  />
                  <span>
                    Ação direcionada
                    <small>Marque se a carta é uma ação que mira outro jogador.</small>
                  </span>
                </label>
              </div>
            )}
          </section>

          {!ehComercial && <section className="card-catalogo carta-form-secao">
            <header><span className="carta-form-passo">4</span><div><h3>Metadados da carta</h3><p>Informações compartilhadas por Cripta e Library, usadas nos filtros do catálogo.</p></div></header>
            <div className="carta-form-linha">
              <label className="catalogo-campo"><span>Sect</span><input value={valores.sect} maxLength={100} onChange={(e) => atualizar('sect', e.target.value)} placeholder="Ex.: Camarilla" /></label>
              <label className="catalogo-campo"><span>Set / edição</span><input value={valores.edicao} maxLength={100} onChange={(e) => atualizar('edicao', e.target.value)} placeholder="Ex.: Third Edition" /></label>
              <label className="catalogo-campo"><span>Artista</span><input value={valores.artista} maxLength={200} onChange={(e) => atualizar('artista', e.target.value)} /></label>
            </div>
            <div className="carta-form-grupo carta-form-precons">
              <div className="carta-form-grupo-cabecalho"><h4>Precons</h4>{botaoCadastroRapido('preconsIds')}</div>
              <SeletorMultiplo
                opcoes={opcoes?.precons ?? []}
                selecionados={valores.preconsIds}
                aoAlterar={(ids) => atualizar('preconsIds', ids)}
                vazio="Nenhum precon cadastrado."
              />
            </div>
            <div className="carta-form-linha">
              <label className="catalogo-campo"><span>Títulos (separe por vírgula)</span><input value={valores.titulos} onChange={(e) => atualizar('titulos', e.target.value)} placeholder="Ex.: Prince, Primogen" /></label>
              <label className="catalogo-campo"><span>Traits (separe por vírgula)</span><input value={valores.traits} onChange={(e) => atualizar('traits', e.target.value)} placeholder="Ex.: +1 stealth, Enter combat" /></label>
            </div>
            <div className="carta-form-linha">
              <label className="catalogo-campo-caixa"><input type="checkbox" checked={valores.primeiraImpressao} onChange={(e) => atualizar('primeiraImpressao', e.target.checked)} /><span>First Print / primeira impressão</span></label>
              <label className="catalogo-campo-caixa"><input type="checkbox" checked={valores.reimpressao} onChange={(e) => atualizar('reimpressao', e.target.checked)} /><span>Reprint / reimpressão</span></label>
            </div>
          </section>}

          {!ehComercial && <section className="card-catalogo carta-form-secao">
            <header>
              <span className="carta-form-passo">5</span>
              <div>
                <h3>Classificação</h3>
                <p>Clique para marcar uma ou mais opções. Tudo aqui é opcional.</p>
              </div>
            </header>

            <div className="carta-form-grupo">
              <div className="carta-form-grupo-cabecalho"><h4>Tipos de carta</h4>{botaoCadastroRapido('tiposCartaIds')}</div>
              <SeletorMultiplo
                opcoes={opcoes?.tiposCarta ?? []}
                selecionados={valores.tiposCartaIds}
                aoAlterar={(ids) => atualizar('tiposCartaIds', ids)}
                vazio="Nenhum tipo de carta cadastrado."
              />
            </div>
            <div className="carta-form-grupo">
              <div className="carta-form-grupo-cabecalho"><h4>Clãs</h4>{botaoCadastroRapido('clasIds')}</div>
              <SeletorMultiplo
                opcoes={opcoes?.clas ?? []}
                selecionados={valores.clasIds}
                aoAlterar={(ids) => atualizar('clasIds', ids)}
                vazio="Nenhum clã cadastrado."
              />
            </div>
            <div className="carta-form-grupo">
              <div className="carta-form-grupo-cabecalho"><h4>Disciplinas</h4>{botaoCadastroRapido('disciplinasIds')}</div>
              <SeletorMultiplo
                opcoes={opcoes?.disciplinas ?? []}
                selecionados={valores.disciplinasIds}
                aoAlterar={(ids) => atualizar('disciplinasIds', ids)}
                vazio="Nenhuma disciplina cadastrada."
              />
            </div>
            <div className="carta-form-grupo">
              <div className="carta-form-grupo-cabecalho"><h4>Idiomas</h4>{botaoCadastroRapido('idiomasIds')}</div>
              <SeletorMultiplo
                opcoes={opcoes?.idiomas ?? []}
                selecionados={valores.idiomasIds}
                aoAlterar={(ids) => atualizar('idiomasIds', ids)}
                vazio="Nenhum idioma cadastrado."
              />
            </div>
            <div className="carta-form-grupo">
              <div className="carta-form-grupo-cabecalho"><h4>Estados</h4>{botaoCadastroRapido('estadosIds')}</div>
              <SeletorMultiplo
                opcoes={opcoes?.estados ?? []}
                selecionados={valores.estadosIds}
                aoAlterar={(ids) => atualizar('estadosIds', ids)}
                vazio="Nenhum estado cadastrado."
              />
            </div>
          </section>}

          <section className="card-catalogo carta-form-secao">
            <header><span className="carta-form-passo">6</span><div><h3>Venda na loja</h3><p>Preço e disponibilidade desta carta.</p></div></header>
            <div className="carta-form-linha">
              <label className="catalogo-campo"><span>Preço (R$)</span><input type="number" min="0.01" max="99999999" step="0.01" value={valores.preco} onChange={(e) => atualizar('preco', e.target.value)} />{campoErro('preco')}</label>
            </div>
            <label className="catalogo-campo-caixa"><input type="checkbox" checked={valores.ativo} onChange={(e) => atualizar('ativo', e.target.checked)} /><span>Disponível na loja</span></label>
          </section>
        </>
      )}

      <div className="carta-form-rodape">
        <Botao variante="fantasma" type="button" onClick={() => navegar('/admin/cartas')}         disabled={salvando}>
          Cancelar
        </Botao>
        <Botao variante="primario" type="submit"         disabled={!tipoEscolhido || salvando}>
                  {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar carta'}
        </Botao>
      </div>

      </form>

      <Modal
        aberto={cadastroRapido !== null}
        aoFechar={fecharCadastroRapido}
        titulo={cadastroRapido ? `Cadastro rápido: ${configuracaoCadastroRapido[cadastroRapido].titulo}` : 'Cadastro rápido'}
        rodape={
          <>
            <Botao variante="fantasma" type="button" onClick={fecharCadastroRapido} disabled={criarCatalogoRapido.isPending || enviandoImagemRapida}>Cancelar</Botao>
            <Botao variante="primario" type="button" onClick={() => { void salvarCadastroRapido(); }} disabled={criarCatalogoRapido.isPending || enviandoImagemRapida || !nomeRapido.trim()}>
              {criarCatalogoRapido.isPending ? 'Salvando...' : 'Cadastrar e selecionar'}
            </Botao>
          </>
        }
      >
        {cadastroRapido && (
          <div className="catalogo-formulario carta-form-modal-rapido" onKeyDown={(evento) => {
            if (evento.key === 'Enter' && evento.target instanceof HTMLInputElement && evento.target.type !== 'file') {
              evento.preventDefault();
              void salvarCadastroRapido();
            }
          }}>
            <label className="catalogo-campo">
              <span>Nome *</span>
              <input autoFocus value={nomeRapido} maxLength={cadastroRapido === 'preconsIds' ? 200 : 100} onChange={(evento) => setNomeRapido(evento.target.value)} />
            </label>
            {cadastroRapido === 'estadosIds' && <label className="catalogo-campo"><span>Sigla *</span><input value={siglaRapida} maxLength={10} onChange={(evento) => setSiglaRapida(evento.target.value.toUpperCase())} /></label>}
            {cadastroRapido === 'tiposCartaIds' && (
              <>
                <label className="catalogo-campo-caixa"><input type="checkbox" checked={somenteCriptaRapido} onChange={(evento) => { setSomenteCriptaRapido(evento.target.checked); if (evento.target.checked) setSomenteLibraryRapido(false); }} /><span>Somente cripta</span></label>
                <label className="catalogo-campo-caixa"><input type="checkbox" checked={somenteLibraryRapido} onChange={(evento) => { setSomenteLibraryRapido(evento.target.checked); if (evento.target.checked) setSomenteCriptaRapido(false); }} /><span>Somente library</span></label>
              </>
            )}
            {cadastroRapido && configuracaoCadastroRapido[cadastroRapido].aceitaImagem && (
              <div className="catalogo-campo catalogo-campo-imagem">
                <span>Ícone (opcional)</span>
                <input type="url" value={imagemUrlRapida} maxLength={500} placeholder="https://..." onChange={(evento) => setImagemUrlRapida(evento.target.value)} />
                <label className="catalogo-upload-imagem"><ImageUp size={16} /><span>{enviandoImagemRapida ? 'Enviando para o S3...' : 'Ou importar arquivo'}</span><input type="file" accept="image/png,image/jpeg,image/webp" disabled={enviandoImagemRapida} onChange={(evento) => { void enviarImagemRapida(evento.target.files?.[0]); evento.currentTarget.value = ''; }} /></label>
                {imagemUrlRapida && <img className="catalogo-preview-imagem" src={imagemUrlRapida} alt="Prévia do ícone" />}
              </div>
            )}
            {erroCadastroRapido && <p className="catalogo-erro-formulario" role="alert">{erroCadastroRapido}</p>}
          </div>
        )}
      </Modal>
    </>
  );
};
