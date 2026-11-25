import React, { useMemo, useState } from 'react';
import { AlertCircle, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Botao } from '@/shared/components/Botao/Botao';
import { Drawer } from '@/shared/components/Drawer/Drawer';
import { Modal } from '@/shared/components/Modal/Modal';
import { Select } from '@/shared/components/Select/Select';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';
import { criarHooksCatalogo, extrairMensagemErro } from '../api/catalogosApi';
import '../components/CatalogoPage/CatalogoPage.css';
import './BannersPage.css';

const TIPO_ACAO_ROTA = 1;
const TIPO_ACAO_CARTAS = 2;

interface BannerAcao {
  tipoAcao: number;
  valorAcao: string;
}

interface Banner {
  id: number;
  imagemUrl: string;
  titulo: string;
  descricao: string;
  chamada: string | null;
  textoBotao: string;
  corBase: string;
  princial: boolean;
  ativo: boolean;
  acao: (BannerAcao & { id: number }) | null;
}

interface BannerPayload {
  imagemUrl: string;
  titulo: string;
  descricao: string;
  chamada: string | null;
  textoBotao: string;
  corBase: string;
  princial: boolean;
  ativo: boolean;
  acao: BannerAcao | null;
}

const hooks = criarHooksCatalogo<Banner, BannerPayload>('banners');

const PAYLOAD_INICIAL: BannerPayload = {
  imagemUrl: '',
  titulo: '',
  descricao: '',
  chamada: '',
  textoBotao: '',
  corBase: '#18191f',
  princial: false,
  ativo: true,
  acao: null,
};

const COR_HEX = /^#[0-9a-fA-F]{6}$/;

const rotuloAcao = (acao: Banner['acao']) => {
  if (!acao) return 'Sem ação';
  return `${acao.tipoAcao === TIPO_ACAO_ROTA ? 'Rota' : 'Cartas'}: ${acao.valorAcao}`;
};

export const BannersPage: React.FC = () => {
  const { data: banners = [], isPending, isError, error, refetch } = hooks.useListar();
  const salvar = hooks.useSalvar();
  const excluir = hooks.useExcluir();
  const toast = useNotificacaoToast();

  const [busca, setBusca] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Banner | null>(null);
  const [valores, setValores] = useState<BannerPayload>(PAYLOAD_INICIAL);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Banner | null>(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return banners;
    return banners.filter((b) => `${b.titulo} ${b.descricao} ${b.chamada ?? ''}`.toLowerCase().includes(termo));
  }, [banners, busca]);

  const atualizar = <K extends keyof BannerPayload>(campo: K, valor: BannerPayload[K]) =>
    setValores((atual) => ({ ...atual, [campo]: valor }));

  const abrirNovo = () => {
    setEmEdicao(null);
    setValores(PAYLOAD_INICIAL);
    setErroFormulario(null);
    setFormularioAberto(true);
  };

  const abrirEdicao = (banner: Banner) => {
    setEmEdicao(banner);
    setValores({
      imagemUrl: banner.imagemUrl,
      titulo: banner.titulo,
      descricao: banner.descricao,
      chamada: banner.chamada ?? '',
      textoBotao: banner.textoBotao,
      corBase: banner.corBase,
      princial: banner.princial,
      ativo: banner.ativo,
      acao: banner.acao ? { tipoAcao: banner.acao.tipoAcao, valorAcao: banner.acao.valorAcao } : null,
    });
    setErroFormulario(null);
    setFormularioAberto(true);
  };

  const fecharFormulario = () => {
    if (!salvar.isPending) setFormularioAberto(false);
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErroFormulario(null);

    if (!COR_HEX.test(valores.corBase)) {
      setErroFormulario('Informe a cor base no formato #RRGGBB.');
      return;
    }

    const payload: BannerPayload = {
      ...valores,
      chamada: valores.chamada?.trim() ? valores.chamada.trim() : null,
      acao: valores.acao && valores.acao.valorAcao.trim() ? valores.acao : null,
    };

    try {
      const resposta = await salvar.mutateAsync({ id: emEdicao?.id, payload });
      toast.sucesso(resposta.message);
      setFormularioAberto(false);
    } catch (erro) {
      setErroFormulario(extrairMensagemErro(erro));
    }
  };

  const confirmarExclusao = async () => {
    if (!paraExcluir) return;

    try {
      const resposta = await excluir.mutateAsync(paraExcluir.id);
      toast.sucesso(resposta.message);
    } catch (erro) {
      toast.erro(extrairMensagemErro(erro));
    } finally {
      setParaExcluir(null);
    }
  };

  return (
    <div className="pagina-catalogo">
      <header className="pagina-catalogo-cabecalho">
        <div className="pagina-catalogo-titulo-bloco">
          <span className="pagina-catalogo-icone">
            <FileText size={20} />
          </span>
          <div>
            <h1 className="pagina-catalogo-titulo">Banners</h1>
            <p className="pagina-catalogo-descricao">Gerencie os banners exibidos na vitrine do aplicativo.</p>
          </div>
        </div>
        <Botao variante="primario" icone={<Plus size={16} />} onClick={abrirNovo}>
          Novo banner
        </Botao>
      </header>

      <section className="card-catalogo">
        <div className="catalogo-ferramentas">
          <label className="catalogo-busca">
            <Search size={15} />
            <input
              type="search"
              placeholder="Buscar banner..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar banner"
            />
          </label>
          <span className="catalogo-contador">
            {filtrados.length} {filtrados.length === 1 ? 'registro' : 'registros'}
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

        {!isPending && !isError && filtrados.length === 0 && (
          <div className="catalogo-estado">
            {busca ? 'Nenhum registro encontrado para a busca.' : 'Nenhum registro cadastrado ainda.'}
          </div>
        )}

        {!isPending && !isError && filtrados.length > 0 && (
          <div className="catalogo-tabela-wrapper">
            <table className="catalogo-tabela">
              <thead>
                <tr>
                  <th>Banner</th>
                  <th>Texto</th>
                  <th>Ação</th>
                  <th>Status</th>
                  <th className="catalogo-coluna-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((banner) => (
                  <tr key={banner.id}>
                    <td>
                      <div className="banner-previa" style={{ background: banner.corBase }}>
                        <img src={banner.imagemUrl} alt={banner.titulo} loading="lazy" />
                      </div>
                    </td>
                    <td>
                      <strong>{banner.titulo}</strong>
                      <div className="banner-descricao">{banner.descricao}</div>
                    </td>
                    <td>
                      <span className="catalogo-selo">{rotuloAcao(banner.acao)}</span>
                    </td>
                    <td className="banner-status">
                      <span className={`catalogo-selo ${banner.ativo ? 'catalogo-selo-sucesso' : ''}`}>
                        {banner.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      {banner.princial && <span className="catalogo-selo">Principal</span>}
                    </td>
                    <td className="catalogo-coluna-acoes">
                      <button
                        type="button"
                        className="catalogo-btn-acao"
                        onClick={() => abrirEdicao(banner)}
                        aria-label={`Editar ${banner.titulo}`}
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="catalogo-btn-acao catalogo-btn-perigo"
                        onClick={() => setParaExcluir(banner)}
                        aria-label={`Excluir ${banner.titulo}`}
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

      <Drawer
        aberto={formularioAberto}
        aoFechar={fecharFormulario}
        titulo={emEdicao ? 'Editar banner' : 'Novo banner'}
        subtitulo="Defina a imagem, os textos e a ação do banner."
        rodape={
          <>
            <Botao variante="fantasma" onClick={fecharFormulario} disabled={salvar.isPending}>
              Cancelar
            </Botao>
            <Botao variante="primario" type="submit" form="formulario-banner" disabled={salvar.isPending}>
              {salvar.isPending ? 'Salvando...' : 'Salvar'}
            </Botao>
          </>
        }
      >
        <form id="formulario-banner" className="catalogo-formulario" onSubmit={enviar}>
          <label className="catalogo-campo">
            <span>URL da imagem</span>
            <input
              type="url"
              required
              value={valores.imagemUrl}
              onChange={(e) => atualizar('imagemUrl', e.target.value)}
              placeholder="https://..."
              autoComplete="off"
            />
          </label>

          {valores.imagemUrl && (
            <div className="banner-previa banner-previa-grande" style={{ background: valores.corBase }}>
              <img src={valores.imagemUrl} alt="Pré-visualização do banner" />
            </div>
          )}

          <label className="catalogo-campo">
            <span>Título</span>
            <input
              type="text"
              required
              value={valores.titulo}
              onChange={(e) => atualizar('titulo', e.target.value)}
              autoComplete="off"
            />
          </label>

          <label className="catalogo-campo">
            <span>Descrição</span>
            <textarea
              required
              rows={3}
              value={valores.descricao}
              onChange={(e) => atualizar('descricao', e.target.value)}
            />
          </label>

          <label className="catalogo-campo">
            <span>Chamada</span>
            <input
              type="text"
              value={valores.chamada ?? ''}
              onChange={(e) => atualizar('chamada', e.target.value)}
              autoComplete="off"
            />
            <small>Opcional.</small>
          </label>

          <div className="banner-linha-dupla">
            <label className="catalogo-campo">
              <span>Texto do botão</span>
              <input
                type="text"
                required
                value={valores.textoBotao}
                onChange={(e) => atualizar('textoBotao', e.target.value)}
                autoComplete="off"
              />
            </label>

            <label className="catalogo-campo">
              <span>Cor base</span>
              <div className="banner-campo-cor">
                <input
                  type="color"
                  value={COR_HEX.test(valores.corBase) ? valores.corBase : '#18191f'}
                  onChange={(e) => atualizar('corBase', e.target.value)}
                  aria-label="Selecionar cor base"
                />
                <input
                  type="text"
                  required
                  maxLength={7}
                  value={valores.corBase}
                  onChange={(e) => atualizar('corBase', e.target.value)}
                  autoComplete="off"
                />
              </div>
            </label>
          </div>

          <div className="banner-linha-dupla">
            <div className="catalogo-campo">
              <span>Tipo da ação</span>
              <Select
                rotuloAcessivel="Tipo da ação"
                valor={valores.acao?.tipoAcao ?? 0}
                opcoes={[
                  { valor: 0, rotulo: 'Sem ação' },
                  { valor: TIPO_ACAO_ROTA, rotulo: 'Rota do aplicativo' },
                  { valor: TIPO_ACAO_CARTAS, rotulo: 'Cartas' },
                ]}
                aoAlterar={(tipo) =>
                  atualizar('acao', tipo ? { tipoAcao: tipo, valorAcao: valores.acao?.valorAcao ?? '' } : null)
                }
              />
            </div>

            <label className="catalogo-campo">
              <span>Valor da ação</span>
              <input
                type="text"
                disabled={!valores.acao}
                required={Boolean(valores.acao)}
                value={valores.acao?.valorAcao ?? ''}
                onChange={(e) =>
                  valores.acao && atualizar('acao', { ...valores.acao, valorAcao: e.target.value })
                }
                placeholder={valores.acao?.tipoAcao === TIPO_ACAO_CARTAS ? 'Ex.: 12,15,18' : 'Ex.: /cartas'}
                autoComplete="off"
              />
            </label>
          </div>

          <label className="catalogo-campo-caixa">
            <input type="checkbox" checked={valores.ativo} onChange={(e) => atualizar('ativo', e.target.checked)} />
            <span>
              Ativo
              <small>Banners inativos não aparecem para os clientes.</small>
            </span>
          </label>

          <label className="catalogo-campo-caixa">
            <input type="checkbox" checked={valores.princial} onChange={(e) => atualizar('princial', e.target.checked)} />
            <span>
              Banner principal
              <small>Apenas um banner pode ser o principal; os demais serão desmarcados.</small>
            </span>
          </label>

          {erroFormulario && (
            <p className="catalogo-erro-formulario" role="alert">
              {erroFormulario}
            </p>
          )}
        </form>
      </Drawer>

      <Modal
        aberto={paraExcluir !== null}
        aoFechar={() => setParaExcluir(null)}
        titulo="Excluir banner"
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setParaExcluir(null)} disabled={excluir.isPending}>
              Cancelar
            </Botao>
            <Botao variante="primario" onClick={() => void confirmarExclusao()} disabled={excluir.isPending}>
              {excluir.isPending ? 'Excluindo...' : 'Excluir'}
            </Botao>
          </>
        }
      >
        <p className="catalogo-confirmacao">
          Deseja realmente excluir <strong>{paraExcluir?.titulo}</strong>? Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
};
