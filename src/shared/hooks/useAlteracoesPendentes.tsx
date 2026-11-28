import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { Modal } from '@/shared/components/Modal/Modal';
import { Botao } from '@/shared/components/Botao/Botao';

const EVENTO_SAIDA = 'joestock:confirmar-saida';
type AcaoSaida = () => Promise<boolean>;

/** Permite confirmar antes de encerrar a sessão, inclusive antes de limpar as credenciais. */
export function solicitarSaida(executar: AcaoSaida) {
  const evento = new CustomEvent(EVENTO_SAIDA, { cancelable: true, detail: executar });
  if (window.dispatchEvent(evento)) void executar();
}

/** Bloqueia navegação interna e avisa antes de recarregar/fechar a aba. */
export function useAlteracoesPendentes(pendente: boolean, salvando = false) {
  const saidaAutorizada = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => pendente && !saidaAutorizada.current &&
    (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search));
  const [acao, setAcao] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!pendente) return;
    const antesDeSair = (evento: BeforeUnloadEvent) => { if (!saidaAutorizada.current) { evento.preventDefault(); evento.returnValue = ''; } };
    const antesDeLogout = (evento: Event) => {
      evento.preventDefault();
      const executar = (evento as CustomEvent<AcaoSaida>).detail;
      setAcao(() => () => {
        saidaAutorizada.current = true;
        void executar().then(sucesso => { if (!sucesso) saidaAutorizada.current = false; })
          .catch(() => { saidaAutorizada.current = false; });
      });
    };
    window.addEventListener('beforeunload', antesDeSair);
    window.addEventListener(EVENTO_SAIDA, antesDeLogout);
    return () => {
      window.removeEventListener('beforeunload', antesDeSair);
      window.removeEventListener(EVENTO_SAIDA, antesDeLogout);
    };
  }, [pendente]);

  const confirmar = useCallback((executar: () => void) => {
    if (pendente) setAcao(() => executar);
    else executar();
  }, [pendente]);
  const cancelar = () => { setAcao(null); if (blocker.state === 'blocked') blocker.reset(); };
  const descartar = () => {
    if (salvando) return;
    const executar = acao;
    setAcao(null);
    if (blocker.state === 'blocked') blocker.proceed();
    else executar?.();
  };

  const modal = <Modal aberto={blocker.state === 'blocked' || !!acao} aoFechar={cancelar} titulo={salvando ? 'Salvando alterações' : pendente ? 'Alterações não salvas' : 'Continuar navegação'}
    rodape={<><Botao type="button" autoFocus onClick={cancelar}>Continuar editando</Botao><Botao type="button" variante="primario" disabled={salvando} onClick={descartar}>{pendente ? 'Descartar alterações' : 'Continuar'}</Botao></>}>
    <p>{salvando ? 'Aguarde o salvamento terminar antes de sair desta página.' : pendente ? 'Existem alterações que ainda não foram salvas. Se continuar, esses ajustes serão perdidos.' : 'As alterações já foram salvas. Você pode continuar.'}</p>
  </Modal>;
  return { confirmar, modal };
}
