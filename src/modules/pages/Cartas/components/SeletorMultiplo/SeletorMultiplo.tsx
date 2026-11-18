import React from 'react';
import { Check } from 'lucide-react';
import './SeletorMultiplo.css';

interface OpcaoMultipla {
  id: number;
  nome: string;
}

interface PropriedadesSeletorMultiplo {
  opcoes: OpcaoMultipla[];
  selecionados: number[];
  aoAlterar: (ids: number[]) => void;
  vazio?: string;
}

/** Seleção múltipla em formato de "chips" clicáveis. */
export const SeletorMultiplo: React.FC<PropriedadesSeletorMultiplo> = ({
  opcoes,
  selecionados,
  aoAlterar,
  vazio = 'Nenhuma opção cadastrada.',
}) => {
  if (opcoes.length === 0) return <p className="seletor-multiplo-vazio">{vazio}</p>;

  const alternar = (id: number) =>
    aoAlterar(selecionados.includes(id) ? selecionados.filter((s) => s !== id) : [...selecionados, id]);

  return (
    <div className="seletor-multiplo" role="group">
      {opcoes.map((opcao) => {
        const ativo = selecionados.includes(opcao.id);
        return (
          <button
            key={opcao.id}
            type="button"
            className={`seletor-multiplo-chip ${ativo ? 'ativo' : ''}`}
            aria-pressed={ativo}
            onClick={() => alternar(opcao.id)}
          >
            {ativo && <Check size={13} />}
            {opcao.nome}
          </button>
        );
      })}
    </div>
  );
};
