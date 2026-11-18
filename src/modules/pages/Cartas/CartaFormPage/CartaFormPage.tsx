import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Image as IconeImagem, Skull, BookOpen } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Botao } from '@/shared/components/Botao/Botao';
import { InputNumero } from '@/shared/components/InputNumero/InputNumero';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';
import { extrairMensagemErro } from '@/modules/pages/Catalogos/api/catalogosApi';
import {
  CartaPayload,
  FILTROS_CARTAS_INICIAIS,
  useAtualizarCarta,
  useCriarCarta,
  useListarCartas,
  useObterCarta,
} from '../api/cartasApi';
import { SeletorMultiplo } from '../components/SeletorMultiplo/SeletorMultiplo';
import '@/modules/pages/Catalogos/components/CatalogoPage/CatalogoPage.css';
import './CartaFormPage.css';

const TIPO_LIBRARY = 1;
const TIPO_CRIPTA = 2;

interface ValoresCarta {
  tipo: number;
  nome: string;
  nomeImpresso: string;
  textoCarta: string;
  imagemUrl: string;
  tiposCartaIds: number[];
  clasIds: number[];
  disciplinasIds: number[];
  idiomasIds: number[];
  estadosIds: number[];
  capacidade: string;
  edicao: string;
  grupo: string;
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
  tiposCartaIds: [],
  clasIds: [],
  disciplinasIds: [],
  idiomasIds: [],
  estadosIds: [],
  capacidade: '',
  edicao: '',
  grupo: '',
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

  useEffect(() => {
    if (!cartaExistente) return;
    const c = cartaExistente;
    setValores({
      tipo: c.tipo,
      nome: c.nome,
      nomeImpresso: c.nomeImpresso && c.nomeImpresso !== c.nome ? c.nomeImpresso : '',
      textoCarta: c.textoCarta,
      imagemUrl: c.imagemUrl ?? '',
      tiposCartaIds: c.tiposCartaIds,
      clasIds: c.clasIds,
      disciplinasIds: c.disciplinasIds,
      idiomasIds: c.idiomasIds,
      estadosIds: c.estadosIds,
      capacidade: c.capacidade != null ? String(c.capacidade) : '',
      edicao: c.edicao ?? '',
      grupo: c.grupo != null ? String(c.grupo) : '',
      custoTipo: c.custoSangue ? 'sangue' : c.custoPool ? 'pool' : 'nenhum',
      custo: String(c.custoSangue || c.custoPool || ''),
      acaoDirecionada: c.acaoDirecionada,
      textoRequisito: c.textoRequisito ?? '',
    });
  }, [cartaExistente]);

  const { data } = useListarCartas({ ...FILTROS_CARTAS_INICIAIS, tipo: valores.tipo, tamanhoPagina: 1 });
  const opcoes = data?.filtros;

  const ehCripta = valores.tipo === TIPO_CRIPTA;
  const tipoEscolhido = valores.tipo !== 0;

  const atualizar = <K extends keyof ValoresCarta>(campo: K, valor: ValoresCarta[K]) => {
    setValores((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: '' }));
    if (campo === 'imagemUrl') setImagemQuebrada(false);
  };

  const escolherTipo = (tipo: number) =>
    setValores((atual) => ({ ...atual, tipo, tiposCartaIds: [] }));

  const idsOpcoes = useMemo(() => new Set((opcoes?.tiposCarta ?? []).map((t) => t.id)), [opcoes?.tiposCarta]);

  const validar = () => {
    const novos: Record<string, string> = {};
    if (!valores.nome.trim()) novos.nome = 'Informe o nome da carta.';
    if (!valores.textoCarta.trim()) novos.textoCarta = 'Informe o texto da carta.';
    if (ehCripta) {
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
      tiposCartaIds: valores.tiposCartaIds.filter((id) => idsOpcoes.has(id)),
      clasIds: valores.clasIds,
      disciplinasIds: valores.disciplinasIds,
      idiomasIds: valores.idiomasIds,
      estadosIds: valores.estadosIds,
      acaoDirecionada: !ehCripta && valores.acaoDirecionada,
      capacidade: ehCripta ? Number(valores.capacidade) : null,
      edicao: ehCripta ? valores.edicao || null : null,
      grupo: ehCripta ? inteiroOuNulo(valores.grupo) : null,
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

  return (
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
                  <span>Texto da carta *</span>
                  <textarea
                    className="carta-form-texto"
                    rows={6}
                    value={valores.textoCarta}
                    placeholder="Texto de regras exatamente como na carta"
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
                <h3>{ehCripta ? 'Dados da cripta' : 'Dados da library'}</h3>
                <p>{ehCripta ? 'Informações exclusivas de cartas de cripta.' : 'Custo e requisitos para jogar a carta.'}</p>
              </div>
            </header>

            {ehCripta ? (
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
                  <span>Edição</span>
                  <input
                    value={valores.edicao}
                    maxLength={100}
                    placeholder="Ex.: Sabbat"
                    onChange={(e) => atualizar('edicao', e.target.value)}
                  />
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

          <section className="card-catalogo carta-form-secao">
            <header>
              <span className="carta-form-passo">4</span>
              <div>
                <h3>Classificação</h3>
                <p>Clique para marcar uma ou mais opções. Tudo aqui é opcional.</p>
              </div>
            </header>

            <div className="carta-form-grupo">
              <h4>Tipos de carta</h4>
              <SeletorMultiplo
                opcoes={opcoes?.tiposCarta ?? []}
                selecionados={valores.tiposCartaIds}
                aoAlterar={(ids) => atualizar('tiposCartaIds', ids)}
                vazio="Nenhum tipo de carta cadastrado."
              />
            </div>
            <div className="carta-form-grupo">
              <h4>Clãs</h4>
              <SeletorMultiplo
                opcoes={opcoes?.clas ?? []}
                selecionados={valores.clasIds}
                aoAlterar={(ids) => atualizar('clasIds', ids)}
                vazio="Nenhum clã cadastrado."
              />
            </div>
            <div className="carta-form-grupo">
              <h4>Disciplinas</h4>
              <SeletorMultiplo
                opcoes={opcoes?.disciplinas ?? []}
                selecionados={valores.disciplinasIds}
                aoAlterar={(ids) => atualizar('disciplinasIds', ids)}
                vazio="Nenhuma disciplina cadastrada."
              />
            </div>
            <div className="carta-form-grupo">
              <h4>Idiomas</h4>
              <SeletorMultiplo
                opcoes={opcoes?.idiomas ?? []}
                selecionados={valores.idiomasIds}
                aoAlterar={(ids) => atualizar('idiomasIds', ids)}
                vazio="Nenhum idioma cadastrado."
              />
            </div>
            <div className="carta-form-grupo">
              <h4>Estados</h4>
              <SeletorMultiplo
                opcoes={opcoes?.estados ?? []}
                selecionados={valores.estadosIds}
                aoAlterar={(ids) => atualizar('estadosIds', ids)}
                vazio="Nenhum estado cadastrado."
              />
            </div>
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
  );
};
