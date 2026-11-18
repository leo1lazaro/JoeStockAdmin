import { useNotificacoesStore, TipoNotificacao } from '@/shared/states/useNotificacoesStore';

export function useNotificacaoToast() {
  const adicionar = useNotificacoesStore((s) => s.adicionarNotificacao);
  const remover = useNotificacoesStore((s) => s.removerNotificacao);
  const limpar = useNotificacoesStore((s) => s.limparTodas);

  const disparar = (mensagem: string, tipo: TipoNotificacao = 'info', titulo?: string) => {
    return adicionar({ mensagem, tipo, titulo });
  };

  return {
    disparar,
    sucesso: (mensagem: string, titulo = 'Sucesso') => disparar(mensagem, 'sucesso', titulo),
    erro: (mensagem: string, titulo = 'Erro') => disparar(mensagem, 'erro', titulo),
    aviso: (mensagem: string, titulo = 'Atenção') => disparar(mensagem, 'aviso', titulo),
    info: (mensagem: string, titulo = 'Info') => disparar(mensagem, 'info', titulo),
    remover,
    limpar,
  };
}
