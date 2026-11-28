import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Select } from '@/shared/components/Select/Select';
import './SeletorMultiplo.css';

interface OpcaoMultipla<T> {
  id: T;
  nome: string;
  sigla?: string | null;
  imagemUrl?: string | null;
}

interface PropriedadesSeletorMultiplo<T extends number | string> {
  rotulo: string;
  opcoes: OpcaoMultipla<T>[];
  selecionados: T[];
  aoAlterar: (ids: T[]) => void;
  vazio?: string;
  adicionarOpcao?: (valor: string) => void;
}

const NOVA_OPCAO = '\0nova';

export function SeletorMultiplo<T extends number | string>({
  rotulo,
  opcoes,
  selecionados,
  aoAlterar,
  vazio = 'Nenhuma opção cadastrada.',
  adicionarOpcao,
}: PropriedadesSeletorMultiplo<T>) {
  const [adicionando, setAdicionando] = useState(false);
  const [novaOpcao, setNovaOpcao] = useState('');
  const disponiveis = opcoes
    .filter((opcao) => !selecionados.includes(opcao.id))
    .map(({ id, nome, sigla }) => ({ valor: id, rotulo: sigla ? `${sigla} · ${nome}` : nome }));
  const itens = adicionarOpcao ? [...disponiveis, { valor: NOVA_OPCAO, rotulo: 'Adicionar outra opção…' }] : disponiveis;

  const confirmarNovaOpcao = () => {
    const valor = novaOpcao.trim();
    if (!valor) return;

    adicionarOpcao?.(valor);
    setNovaOpcao('');
    setAdicionando(false);
  };

  return (
    <div className="seletor-multiplo-campo">
      <Select<T | string>
        valor=""
        opcoes={itens}
        aoAlterar={(id) => {
          if (id === NOVA_OPCAO) setAdicionando(true);
          else aoAlterar([...selecionados, id as T]);
        }}
        desabilitado={itens.length === 0}
        placeholder={opcoes.length === 0 && !adicionarOpcao ? vazio : itens.length ? 'Adicionar opção' : 'Todas as opções selecionadas'}
        rotuloAcessivel={rotulo}
      />
      {adicionando && (
        <div className="seletor-multiplo">
          <input
            autoFocus
            aria-label={`Nova opção em ${rotulo}`}
            maxLength={200}
            value={novaOpcao}
            onChange={(evento) => setNovaOpcao(evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter') {
                evento.preventDefault();
                confirmarNovaOpcao();
              }
            }}
          />
          <button type="button" className="seletor-multiplo-chip" onClick={confirmarNovaOpcao} disabled={!novaOpcao.trim()}>
            <Plus size={14} /> Adicionar
          </button>
          <button type="button" className="seletor-multiplo-chip" onClick={() => setAdicionando(false)}>Cancelar</button>
        </div>
      )}
      {selecionados.length > 0 && (
        <div className="seletor-multiplo" role="group" aria-label={`${rotulo} selecionados`}>
          {selecionados.map((id) => {
            const opcao = opcoes.find((item) => item.id === id);
            const nome = opcao?.nome ?? String(id);
            return (
              <button
                key={id}
                type="button"
                className="seletor-multiplo-chip"
                aria-label={`Remover ${nome}`}
                onClick={() => aoAlterar(selecionados.filter((selecionado) => selecionado !== id))}
              >
                {opcao?.imagemUrl && <img className="seletor-multiplo-icone" src={opcao.imagemUrl} alt="" loading="lazy" />}
                {opcao?.sigla ?? nome}
                <X size={13} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
