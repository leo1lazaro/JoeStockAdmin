import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Botao } from '@/shared/components/Botao/Botao';
import { InputNumero } from '@/shared/components/InputNumero/InputNumero';
import './ModalNovaTransacao.css';

interface PropriedadesModalNovaTransacao {
  aberto: boolean;
  aoFechar: () => void;
  aoSubmeter: (dados: {
    empresa: string;
    categoria: string;
    valor: number;
    tipo: 'receita' | 'despesa';
  }) => Promise<void>;
  carregando?: boolean;
}

export const ModalNovaTransacao: React.FC<PropriedadesModalNovaTransacao> = ({
  aberto,
  aoFechar,
  aoSubmeter,
  carregando = false,
}) => {
  const [empresa, setEmpresa] = useState('');
  const [categoria, setCategoria] = useState('Electronics');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');

  const tratarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.trim() || !valor) return;

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) return;

    const valorFinal = tipo === 'despesa' ? -Math.abs(valorNumerico) : Math.abs(valorNumerico);

    await aoSubmeter({
      empresa,
      categoria,
      valor: valorFinal,
      tipo,
    });

    setEmpresa('');
    setValor('');
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Nova Operação / Transação"
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar} type="button">
            Cancelar
          </Botao>
          <Botao
            variante="primario"
            onClick={tratarEnvio}
            disabled={carregando || !empresa.trim() || !valor}
          >
            {carregando ? 'Processando...' : 'Confirmar'}
          </Botao>
        </>
      }
    >
      <form onSubmit={tratarEnvio} className="form-nova-transacao">
        <div className="seletor-tipo-operacao">
          <button
            type="button"
            className={`btn-opcao-tipo ${tipo === 'despesa' ? 'selecionado' : ''}`}
            onClick={() => setTipo('despesa')}
          >
            Despesa / Envio
          </button>
          <button
            type="button"
            className={`btn-opcao-tipo ${tipo === 'receita' ? 'selecionado' : ''}`}
            onClick={() => setTipo('receita')}
          >
            Receita / Entrada
          </button>
        </div>

        <div className="campo-grupo-formulario">
          <label className="campo-rotulo">Beneficiário / Empresa</label>
          <input
            type="text"
            className="campo-input-texto"
            placeholder="Ex: Apple, Uber, Spotify..."
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            required
          />
        </div>

        <div className="campo-grupo-formulario">
          <label className="campo-rotulo">Categoria</label>
          <select
            className="campo-select"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="Electronics">Electronics</option>
            <option value="Food & Drink">Food & Drink</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Services">Services</option>
            <option value="Shopping">Shopping</option>
          </select>
        </div>

        <div className="campo-grupo-formulario">
          <label className="campo-rotulo">Valor em Dólares ($)</label>
          <InputNumero
            casasDecimais={2}
            min={0}
            className="campo-input-texto"
            placeholder="Ex: 59.99"
            valor={valor}
            aoAlterar={setValor}
            required
          />
        </div>
      </form>
    </Modal>
  );
};
