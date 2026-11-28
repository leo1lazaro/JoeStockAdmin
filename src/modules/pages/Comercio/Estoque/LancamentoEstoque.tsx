import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Boxes, ChevronDown, Plus, Search, X } from 'lucide-react';
import { clienteApi } from '@/app/config/apiConfig';
import { Botao } from '@/shared/components/Botao/Botao';
import { Select } from '@/shared/components/Select/Select';
import { useListarFiltrosCartas, useObterCarta } from '@/modules/pages/Cartas/api/cartasApi';
import { extrairMensagemErro } from '@/modules/pages/Catalogos/api/catalogosApi';
import { type RespostaEstoque, dadosEstoque, quantidadeValida, tipoCarta } from './estoque';

interface CartaOpcao { id: number; nome: string; imagemUrl?: string | null; tipo: number }

export function LancamentoEstoque({ aoSalvar, aoPendente, aoSalvando, confirmar, bloqueado }: {
  aoSalvar: () => Promise<void>; aoPendente: (valor: boolean) => void;
  aoSalvando: (valor: boolean) => void;
  confirmar: (acao: () => void) => void; bloqueado: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [carta, setCarta] = useState<CartaOpcao | null>(null);
  const [impressaoId, setImpressaoId] = useState(0);
  const [estadoId, setEstadoId] = useState(0);
  const [quantidade, setQuantidade] = useState('');
  const [ativo, setAtivo] = useState(-1);
  const campoBusca = useRef<HTMLInputElement>(null);
  const pendente = !!carta || !!quantidade;
  useEffect(() => { aoPendente(pendente); }, [pendente, aoPendente]);
  useEffect(() => { const timer = window.setTimeout(() => setTermo(busca.trim()), 250); return () => window.clearTimeout(timer); }, [busca]);
  const filtros = useListarFiltrosCartas();
  const detalhe = useObterCarta(carta?.id);
  const cartas = useQuery({ queryKey: ['admin', 'estoque', 'buscar-cartas', termo], enabled: aberto && !carta && termo.length >= 2,
    queryFn: async () => dadosEstoque((await clienteApi.get<RespostaEstoque<{ cartas: CartaOpcao[] }>>('/cartas', { params: { Termo: termo, Pagina: 1, TamanhoPagina: 20 } })).data).cartas,
  });
  const limpar = () => { setCarta(null); setImpressaoId(0); setEstadoId(0); setQuantidade(''); setBusca(''); setTermo(''); setAtivo(-1); };
  const salvar = useMutation({ mutationFn: async () => {
    const estado = filtros.data?.estados.find(e => e.id === estadoId);
    return dadosEstoque((await clienteApi.post<RespostaEstoque<unknown>>('/admin/estoque', {
      cartasId: carta!.id, cartasImpressaoId: impressaoId || undefined, quantidade: Number(quantidade),
      propriedades: estado ? [{ grupo: 'estado', valorId: estado.id, valor: estado.nome }] : [],
    })).data);
  }, onSuccess: async () => { limpar(); await aoSalvar(); campoBusca.current?.focus(); }, meta: { desativarNotificacao: true } });
  useEffect(() => { aoSalvando(salvar.isPending); }, [salvar.isPending, aoSalvando]);
  const selecionar = (item: CartaOpcao) => {
    const acao = () => { setCarta(item); setBusca(''); setAtivo(-1); setImpressaoId(0); setEstadoId(0); salvar.reset(); };
    if (pendente) confirmar(acao); else acao();
  };
  const navegar = (e: KeyboardEvent<HTMLInputElement>) => {
    const lista = cartas.data ?? [];
    if (e.key === 'Escape') { setBusca(''); setAtivo(-1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); setAtivo(i => Math.min(i + 1, lista.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setAtivo(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); if (lista[ativo]) selecionar(lista[ativo]); }
  };
  const comercial = carta?.tipo === 3;
  const enviando = bloqueado || salvar.isPending;
  const valido = !!carta && quantidadeValida(quantidade) && (comercial || (!!impressaoId && !!estadoId));
  function enviar(e: FormEvent) { e.preventDefault(); if (valido && !enviando) salvar.mutate(); }

  return <section className="Comercio-card Estoque-lancamento">
    <button type="button" className="Estoque-cadastro-resumo" aria-expanded={aberto} aria-controls="Estoque-cadastro" onClick={() => setAberto(!aberto)}>
      <span className="Estoque-icone"><Plus size={19} /></span><span><strong>Cadastrar combinação</strong><small>Adicione uma impressão e um estado físico ao estoque.</small></span>
      {pendente && <span className="Estoque-pendente-badge">Em preenchimento</span>}<ChevronDown size={18} className={aberto ? 'Estoque-seta-aberta' : ''} />
    </button>
    <div id="Estoque-cadastro" hidden={!aberto}>
      <form className="Estoque-cadastro-form" onSubmit={enviar}>
        <fieldset disabled={enviando} className="Estoque-cadastro-linha">
          <div className="Estoque-campo Estoque-campo-autocomplete"><span>Buscar carta / produto</span>
            {carta ? <div className="Estoque-carta-selecionada"><Boxes size={16} /><strong>{carta.nome}</strong><button type="button" aria-label="Limpar carta selecionada" onClick={() => confirmar(limpar)}><X size={15} /></button></div>
              : <span className="Estoque-busca"><Search size={16} /><input ref={campoBusca} value={busca} onChange={e => { setBusca(e.target.value); setAtivo(-1); }} onKeyDown={navegar}
                placeholder="Digite ao menos 2 letras" role="combobox" aria-autocomplete="list" aria-expanded={busca.trim().length >= 2} aria-controls="Estoque-cartas" aria-activedescendant={cartas.data?.[ativo] ? `Estoque-carta-${cartas.data[ativo].id}` : undefined} /></span>}
            {!carta && busca.trim().length >= 2 && <div className="Estoque-autocomplete-resultados" id="Estoque-cartas" role="listbox">
              {cartas.isFetching || busca.trim() !== termo ? <p>Buscando…</p> : cartas.isError ? <p>Não foi possível buscar.</p> : !cartas.data?.length ? <p>Nenhuma carta encontrada.</p> : cartas.data.map((item, indice) => <button type="button" role="option" aria-selected={indice === ativo} id={`Estoque-carta-${item.id}`} className={indice === ativo ? 'ativo' : ''} key={item.id} onClick={() => selecionar(item)}>
                {item.imagemUrl && <img src={item.imagemUrl} alt="" loading="lazy" />}<span><strong>{item.nome}</strong><small>{tipoCarta(item.tipo)}</small></span>
              </button>)}
            </div>}
          </div>
          <div className="Estoque-campo"><span>Impressão</span><Select valor={impressaoId} aoAlterar={setImpressaoId} rotuloAcessivel="Impressão" desabilitado={!carta || comercial || enviando || detalhe.isFetching}
            opcoes={(detalhe.data?.impressoes ?? []).filter(i => i.id).map(i => ({ valor: i.id!, rotulo: `${i.edicao} · ${filtros.data?.idiomas.find(l => l.id === i.idiomaId)?.nome ?? 'Idioma'}` }))} placeholder={comercial ? 'Produto comercial' : detalhe.isFetching ? 'Carregando…' : 'Selecione a impressão'} /></div>
          <div className="Estoque-campo"><span>Estado físico</span><Select valor={estadoId} aoAlterar={setEstadoId} rotuloAcessivel="Estado físico" desabilitado={!carta || enviando} opcoes={filtros.data?.estados.map(e => ({ valor: e.id, rotulo: e.sigla ? `${e.sigla} · ${e.nome}` : e.nome })) ?? []} /></div>
          <label className="Estoque-campo"><span>Quantidade</span><input type="text" inputMode="numeric" pattern="[0-9]{1,5}" maxLength={5} value={quantidade} onChange={e => setQuantidade(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="0" /></label>
          <Botao type="submit" variante="primario" disabled={!valido || enviando || detalhe.isFetching}>{salvar.isPending ? 'Salvando…' : 'Salvar combinação'}</Botao>
        </fieldset>
        {carta && !comercial && detalhe.isSuccess && !detalhe.data.impressoes?.length && <p className="Estoque-aviso">Cadastre as impressões na edição desta carta antes de criar uma combinação.</p>}
        {(detalhe.isError || filtros.isError) && <p className="Estoque-erro" role="alert">Não foi possível carregar as opções. Tente novamente.</p>}
        {salvar.isError && <p className="Estoque-erro" role="alert">{extrairMensagemErro(salvar.error)}</p>}
      </form>
    </div>
  </section>;
}
