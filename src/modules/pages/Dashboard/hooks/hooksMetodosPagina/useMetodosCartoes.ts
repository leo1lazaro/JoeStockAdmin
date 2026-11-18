import { useState } from 'react';
import { usePainelStore } from '@/shared/states/usePainelStore';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';

export function useMetodosCartoes() {
  const { cartaoAtivoId, definirCartaoAtivo } = usePainelStore();
  const toast = useNotificacaoToast();

  const [cartoesCongelados, setCartoesCongelados] = useState<Record<string, boolean>>({});
  const [modalPinAberto, setModalPinAberto] = useState(false);
  const [pinVisualizado, setPinVisualizado] = useState<string | null>(null);

  const aoSelecionarCartao = (idCartao: string) => {
    definirCartaoAtivo(idCartao);
  };

  const aoCongelarCartao = (idCartao = cartaoAtivoId) => {
    const estaCongelado = !cartoesCongelados[idCartao];
    setCartoesCongelados((prev) => ({
      ...prev,
      [idCartao]: estaCongelado,
    }));

    if (estaCongelado) {
      toast.aviso('Cartão temporariamente congelado para novas compras.', 'Cartão Bloqueado');
    } else {
      toast.sucesso('Cartão desbloqueado e liberado para uso.', 'Cartão Ativo');
    }
  };

  const aoVerPin = (idCartao = cartaoAtivoId) => {
    const pinSimulado = Math.floor(1000 + Math.random() * 9000).toString();
    setPinVisualizado(pinSimulado);
    setModalPinAberto(true);
    toast.info(`PIN do cartão visualizado com segurança.`, 'Segurança 21X0');
  };

  const aoFecharModalPin = () => {
    setModalPinAberto(false);
    setPinVisualizado(null);
  };

  return {
    cartaoAtivoId,
    aoSelecionarCartao,
    cartoesCongelados,
    aoCongelarCartao,
    aoVerPin,
    modalPinAberto,
    pinVisualizado,
    aoFecharModalPin,
  };
}
