import React from 'react';

interface PropriedadesInputNumero
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'min' | 'max'> {
  /** Valor como texto, usando "." como separador decimal (ex.: "12.5"). */
  valor: string;
  aoAlterar: (valor: string) => void;
  /** Máximo de casas decimais. 0 (padrão) aceita apenas inteiros. */
  casasDecimais?: number;
  min?: number;
  max?: number;
}

function sanitizar(texto: string, casasDecimais: number, permiteNegativo: boolean) {
  let limpo = texto.replace(',', '.').replace(permiteNegativo ? /[^\d.-]/g : /[^\d.]/g, '');

  const negativo = permiteNegativo && limpo.startsWith('-');
  limpo = limpo.replace(/-/g, '');

  if (casasDecimais <= 0) {
    limpo = limpo.replace(/\./g, '');
  } else {
    const [inteiro, ...resto] = limpo.split('.');
    limpo = resto.length > 0 ? `${inteiro}.${resto.join('').slice(0, casasDecimais)}` : inteiro;
  }

  return negativo ? `-${limpo}` : limpo;
}

/** Input numérico padrão: sem setas, com controle de casas decimais e limites. */
export const InputNumero: React.FC<PropriedadesInputNumero> = ({
  valor,
  aoAlterar,
  casasDecimais = 0,
  min,
  max,
  onBlur,
  ...resto
}) => {
  const permiteNegativo = min === undefined || min < 0;

  const aoDigitar = (e: React.ChangeEvent<HTMLInputElement>) =>
    aoAlterar(sanitizar(e.target.value, casasDecimais, permiteNegativo));

  const aoSair = (e: React.FocusEvent<HTMLInputElement>) => {
    let numero = Number(valor);
    if (valor !== '' && !Number.isNaN(numero)) {
      if (min !== undefined && numero < min) numero = min;
      if (max !== undefined && numero > max) numero = max;
      const ajustado = String(numero);
      if (ajustado !== valor) aoAlterar(ajustado);
    } else if (valor !== '') {
      aoAlterar('');
    }
    onBlur?.(e);
  };

  return (
    <input
      {...resto}
      type="text"
      inputMode={casasDecimais > 0 ? 'decimal' : 'numeric'}
      autoComplete="off"
      value={valor}
      onChange={aoDigitar}
      onBlur={aoSair}
    />
  );
};
