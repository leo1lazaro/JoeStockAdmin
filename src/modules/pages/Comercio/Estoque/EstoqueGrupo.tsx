import { useId, useRef, type KeyboardEvent } from 'react';
import { Boxes, ChevronDown } from 'lucide-react';
import { type GrupoEstoque, type AjustesEstoque, type LinhaEstoque, propriedade, quantidadeValida, tipoCarta } from './estoque';

export function EstoqueGrupo({ grupo, aberto, alternar, ajustes, alterar, revisar, bloqueado }: {
  grupo: GrupoEstoque; aberto: boolean; alternar: () => void; ajustes: AjustesEstoque;
  alterar: (linha: LinhaEstoque, texto: string) => void; bloqueado: boolean;
  revisar: (linha: LinhaEstoque) => void;
}) {
  const id = useId();
  const linhasRef = useRef<HTMLTableSectionElement>(null);
  const navegarQuantidades = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.nativeEvent.isComposing || evento.ctrlKey || evento.altKey || evento.metaKey || evento.shiftKey) return;
    if (!['Enter', 'ArrowDown', 'ArrowUp'].includes(evento.key)) return;
    evento.preventDefault();
    const campos = Array.from(linhasRef.current?.querySelectorAll<HTMLInputElement>('.Estoque-quantidade-linha input:not(:disabled)') ?? []);
    const indice = campos.indexOf(evento.currentTarget);
    const proximo = campos[indice + (evento.key === 'ArrowUp' ? -1 : 1)];
    if (!proximo) return;
    proximo.focus({ preventScroll: true });
    proximo.select();
    proximo.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  const pendentes = Object.values(ajustes).filter(i => i.cartasId === grupo.cartasId);
  const total = grupo.quantidadeTotal + pendentes.reduce((soma, i) => soma + (quantidadeValida(i.texto) ? Number(i.texto) - i.anterior : 0), 0);
  return <article className={`Estoque-produto ${pendentes.length ? 'Estoque-produto-alterado' : ''}`}>
    <button type="button" className="Estoque-produto-resumo" aria-expanded={aberto} aria-controls={id} onClick={alternar}>
      {grupo.imagemUrl ? <img src={grupo.imagemUrl} alt="" loading="lazy" /> : <span className="Estoque-produto-sem-imagem"><Boxes size={20} /></span>}
      <span className="Estoque-produto-nome"><strong>{grupo.nome}</strong><small>{tipoCarta(grupo.tipo)} · {grupo.combinacoes.length} {grupo.combinacoes.length === 1 ? 'combinação' : 'combinações'}</small></span>
      {!!pendentes.length && <span className="Estoque-pendente-badge">{pendentes.length} {pendentes.length === 1 ? 'alteração' : 'alterações'}</span>}
      <span className="Estoque-produto-total"><strong>{total}</strong><small>unidades</small></span>
      <ChevronDown size={18} className={aberto ? 'Estoque-seta-aberta' : ''} />
    </button>
    <div id={id} hidden={!aberto} className="Estoque-produto-detalhes">
      <div className="Comercio-tabela-container"><table className="Comercio-tabela Estoque-combinacoes"><thead><tr><th>Edição</th><th>Idioma</th><th>Estado físico</th><th>Quantidade</th></tr></thead><tbody ref={linhasRef}>
        {grupo.combinacoes.map(linha => {
          const ajuste = ajustes[linha.id];
          const texto = ajuste?.texto ?? String(linha.quantidade);
          const conflito = !!ajuste && ajuste.anterior !== linha.quantidade;
          return <tr key={linha.id} className={ajuste ? 'Estoque-combinacao-alterada' : ''}>
            <td>{propriedade(linha, 'set') || (linha.tipo === 3 ? 'Padrão' : 'Não informada')}
              {linha.tipo !== 3 && !linha.cartasImpressaoId && <small>Impressão pendente de associação</small>}</td>
            <td>{propriedade(linha, 'idioma') || '—'}</td><td>{propriedade(linha, 'estado') || '—'}</td>
            <td><div className="Estoque-saldo-celula"><label className="Estoque-quantidade-linha"><span className="Estoque-sr-only">Quantidade de {grupo.nome}, {propriedade(linha, 'set')}, {propriedade(linha, 'idioma')}, {propriedade(linha, 'estado')}, combinação {linha.id}</span>
              <input type="text" inputMode="numeric" pattern="[0-9]{1,5}" maxLength={5} value={texto} disabled={bloqueado}
                title="Enter ou ↓: próxima quantidade. ↑: quantidade anterior."
                onFocus={e => e.currentTarget.select()} onKeyDown={navegarQuantidades}
                aria-invalid={!quantidadeValida(texto) || conflito} onChange={e => alterar(linha, e.target.value.replace(/\D/g, '').slice(0, 5))} />
            </label>{ajuste && <small className={conflito ? 'Estoque-saldo-original Estoque-erro' : 'Estoque-saldo-original'}>{conflito ? `Atual: ${linha.quantidade}` : `Antes: ${ajuste.anterior}`}</small>}</div>
              {conflito && <button type="button" className="Estoque-revisar" disabled={bloqueado} onClick={() => revisar(linha)}>Manter meu ajuste sobre o saldo atual</button>}
              {!quantidadeValida(texto) && <small className="Estoque-erro">Informe uma quantidade, inclusive zero.</small>}</td>
          </tr>;
        })}
      </tbody></table></div>
    </div>
  </article>;
}
