import React, { useMemo, useState } from 'react';
import { AlertCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Botao } from '@/shared/components/Botao/Botao';
import { Modal } from '@/shared/components/Modal/Modal';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';
import { criarHooksCatalogo, extrairMensagemErro } from '../../api/catalogosApi';
import './CatalogoPage.css';

export interface CampoCatalogo<TPayload> {
  nome: keyof TPayload & string;
  rotulo: string;
  tipo: 'texto' | 'caixa';
  placeholder?: string;
  maxLength?: number;
  obrigatorio?: boolean;
  ajuda?: string;
  maiusculas?: boolean;
}

export interface ColunaCatalogo<TItem> {
  titulo: string;
  renderizar: (item: TItem) => React.ReactNode;
}

interface PropriedadesCatalogoPage<TItem extends { id: number }, TPayload> {
  titulo: string;
  descricao: string;
  /** Nome no singular, ex.: "Disciplina" */
  nomeSingular: string;
  /** Artigo para concordância das mensagens: "o" ou "a" */
  artigo: 'o' | 'a';
  icone: React.ReactNode;
  hooks: ReturnType<typeof criarHooksCatalogo<TItem, TPayload>>;
  campos: CampoCatalogo<TPayload>[];
  colunas: ColunaCatalogo<TItem>[];
  payloadInicial: TPayload;
  paraPayload: (item: TItem) => TPayload;
  textoBusca: (item: TItem) => string;
  rotuloItem: (item: TItem) => string;
}

export function CatalogoPage<TItem extends { id: number }, TPayload extends object>({
  titulo,
  descricao,
  nomeSingular,
  artigo,
  icone,
  hooks,
  campos,
  colunas,
  payloadInicial,
  paraPayload,
  textoBusca,
  rotuloItem,
}: PropriedadesCatalogoPage<TItem, TPayload>) {
  const { data: itens = [], isPending, isError, error, refetch } = hooks.useListar();
  const salvar = hooks.useSalvar();
  const excluir = hooks.useExcluir();
  const toast = useNotificacaoToast();

  const [busca, setBusca] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<TItem | null>(null);
  const [valores, setValores] = useState<TPayload>(payloadInicial);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);
  const [itemParaExcluir, setItemParaExcluir] = useState<TItem | null>(null);

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return itens;
    return itens.filter((item) => textoBusca(item).toLowerCase().includes(termo));
  }, [itens, busca, textoBusca]);

  const abrirNovo = () => {
    setItemEmEdicao(null);
    setValores(payloadInicial);
    setErroFormulario(null);
    setFormularioAberto(true);
  };

  const abrirEdicao = (item: TItem) => {
    setItemEmEdicao(item);
    setValores(paraPayload(item));
    setErroFormulario(null);
    setFormularioAberto(true);
  };

  const fecharFormulario = () => {
    if (salvar.isPending) return;
    setFormularioAberto(false);
  };

  const alterarCampo = (campo: CampoCatalogo<TPayload>, valor: string | boolean) => {
    const valorFinal = typeof valor === 'string' && campo.maiusculas ? valor.toUpperCase() : valor;
    setValores((atual) => ({ ...atual, [campo.nome]: valorFinal }));
  };

  const enviarFormulario = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErroFormulario(null);

    try {
      const resposta = await salvar.mutateAsync({ id: itemEmEdicao?.id, payload: valores });
      toast.sucesso(resposta.message);
      setFormularioAberto(false);
    } catch (erro) {
      setErroFormulario(extrairMensagemErro(erro));
    }
  };

  const confirmarExclusao = async () => {
    if (!itemParaExcluir) return;

    try {
      const resposta = await excluir.mutateAsync(itemParaExcluir.id);
      toast.sucesso(resposta.message);
    } catch (erro) {
      toast.erro(extrairMensagemErro(erro));
    } finally {
      setItemParaExcluir(null);
    }
  };

  return (
    <div className="pagina-catalogo">
      <header className="pagina-catalogo-cabecalho">
        <div className="pagina-catalogo-titulo-bloco">
          <span className="pagina-catalogo-icone">{icone}</span>
          <div>
            <h1 className="pagina-catalogo-titulo">{titulo}</h1>
            <p className="pagina-catalogo-descricao">{descricao}</p>
          </div>
        </div>
        <Botao variante="primario" icone={<Plus size={16} />} onClick={abrirNovo}>
          Nov{artigo} {nomeSingular.toLowerCase()}
        </Botao>
      </header>

      <section className="card-catalogo">
        <div className="catalogo-ferramentas">
          <label className="catalogo-busca">
            <Search size={15} />
            <input
              type="search"
              placeholder={`Buscar ${nomeSingular.toLowerCase()}...`}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label={`Buscar ${nomeSingular.toLowerCase()}`}
            />
          </label>
          <span className="catalogo-contador">
            {itensFiltrados.length} {itensFiltrados.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {isPending && (
          <div className="catalogo-estado" role="status">
            Carregando...
          </div>
        )}

        {isError && (
          <div className="catalogo-estado catalogo-estado-erro" role="alert">
            <AlertCircle size={18} />
            <p>{extrairMensagemErro(error)}</p>
            <Botao onClick={() => void refetch()}>Tentar novamente</Botao>
          </div>
        )}

        {!isPending && !isError && itensFiltrados.length === 0 && (
          <div className="catalogo-estado">
            {busca ? 'Nenhum registro encontrado para a busca.' : `Nenhum registro cadastrado ainda.`}
          </div>
        )}

        {!isPending && !isError && itensFiltrados.length > 0 && (
          <div className="catalogo-tabela-wrapper">
            <table className="catalogo-tabela">
              <thead>
                <tr>
                  {colunas.map((coluna) => (
                    <th key={coluna.titulo}>{coluna.titulo}</th>
                  ))}
                  <th className="catalogo-coluna-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensFiltrados.map((item) => (
                  <tr key={item.id}>
                    {colunas.map((coluna) => (
                      <td key={coluna.titulo}>{coluna.renderizar(item)}</td>
                    ))}
                    <td className="catalogo-coluna-acoes">
                      <button
                        type="button"
                        className="catalogo-btn-acao"
                        onClick={() => abrirEdicao(item)}
                        aria-label={`Editar ${rotuloItem(item)}`}
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="catalogo-btn-acao catalogo-btn-perigo"
                        onClick={() => setItemParaExcluir(item)}
                        aria-label={`Excluir ${rotuloItem(item)}`}
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        aberto={formularioAberto}
        aoFechar={fecharFormulario}
        titulo={itemEmEdicao ? `Editar ${nomeSingular.toLowerCase()}` : `Nov${artigo} ${nomeSingular.toLowerCase()}`}
        rodape={
          <>
            <Botao variante="fantasma" onClick={fecharFormulario} disabled={salvar.isPending}>
              Cancelar
            </Botao>
            <Botao variante="primario" type="submit" form="formulario-catalogo" disabled={salvar.isPending}>
              {salvar.isPending ? 'Salvando...' : 'Salvar'}
            </Botao>
          </>
        }
      >
        <form id="formulario-catalogo" className="catalogo-formulario" onSubmit={enviarFormulario}>
          {campos.map((campo) => {
            const valor = (valores as Record<string, unknown>)[campo.nome];

            if (campo.tipo === 'caixa') {
              return (
                <label key={campo.nome} className="catalogo-campo-caixa">
                  <input
                    type="checkbox"
                    checked={Boolean(valor)}
                    onChange={(e) => alterarCampo(campo, e.target.checked)}
                  />
                  <span>
                    {campo.rotulo}
                    {campo.ajuda && <small>{campo.ajuda}</small>}
                  </span>
                </label>
              );
            }

            return (
              <label key={campo.nome} className="catalogo-campo">
                <span>{campo.rotulo}</span>
                <input
                  type="text"
                  value={typeof valor === 'string' ? valor : ''}
                  onChange={(e) => alterarCampo(campo, e.target.value)}
                  placeholder={campo.placeholder}
                  maxLength={campo.maxLength}
                  required={campo.obrigatorio}
                  autoComplete="off"
                />
                {campo.ajuda && <small>{campo.ajuda}</small>}
              </label>
            );
          })}
          {erroFormulario && (
            <p className="catalogo-erro-formulario" role="alert">
              {erroFormulario}
            </p>
          )}
        </form>
      </Modal>

      <Modal
        aberto={itemParaExcluir !== null}
        aoFechar={() => setItemParaExcluir(null)}
        titulo={`Excluir ${nomeSingular.toLowerCase()}`}
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setItemParaExcluir(null)} disabled={excluir.isPending}>
              Cancelar
            </Botao>
            <Botao variante="primario" onClick={() => void confirmarExclusao()} disabled={excluir.isPending}>
              {excluir.isPending ? 'Excluindo...' : 'Excluir'}
            </Botao>
          </>
        }
      >
        <p className="catalogo-confirmacao">
          Deseja realmente excluir <strong>{itemParaExcluir ? rotuloItem(itemParaExcluir) : ''}</strong>? Esta ação não
          pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
