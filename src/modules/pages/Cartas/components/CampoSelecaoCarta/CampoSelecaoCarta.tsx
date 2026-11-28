import { useState, type ReactNode } from 'react';
import { Select } from '@/shared/components/Select/Select';

interface PropriedadesCampoSelecaoCarta {
  rotulo: string;
  valor: string;
  opcoes: string[];
  aoAlterar: (valor: string) => void;
  obrigatorio?: boolean;
  desabilitado?: boolean;
  novoValor?: { maxLength: number } | { min: number };
  children?: ReactNode;
}

const NOVO_VALOR = '\0novo';

export function CampoSelecaoCarta({
  rotulo,
  valor,
  opcoes,
  aoAlterar,
  obrigatorio = false,
  desabilitado = false,
  novoValor,
  children,
}: PropriedadesCampoSelecaoCarta) {
  const [editandoValor, setEditandoValor] = useState(false);
  const valores = [...new Set([...opcoes, ...(valor ? [valor] : [])])];
  const itens = valores.map((item) => ({ valor: item, rotulo: item }));
  if (!obrigatorio) itens.unshift({ valor: '', rotulo: 'Não informado' });
  if (novoValor) itens.push({ valor: NOVO_VALOR, rotulo: 'Adicionar outro valor…' });

  return (
    <div className="catalogo-campo">
      <span>{rotulo}{obrigatorio && ' *'}</span>
      <Select
        desabilitado={desabilitado}
        valor={editandoValor ? NOVO_VALOR : valor}
        opcoes={itens}
        rotuloAcessivel={rotulo}
        aoAlterar={(selecionado) => {
          setEditandoValor(selecionado === NOVO_VALOR);
          if (selecionado !== NOVO_VALOR) aoAlterar(selecionado);
        }}
      />
      {editandoValor && novoValor && (
        <input
          autoFocus
          disabled={desabilitado}
          required={obrigatorio}
          aria-label={`Outro valor para ${rotulo}`}
          type={'min' in novoValor ? 'number' : 'text'}
          min={'min' in novoValor ? novoValor.min : undefined}
          maxLength={'maxLength' in novoValor ? novoValor.maxLength : undefined}
          value={valor}
          onChange={(evento) => aoAlterar(evento.target.value)}
        />
      )}
      {children}
    </div>
  );
}
