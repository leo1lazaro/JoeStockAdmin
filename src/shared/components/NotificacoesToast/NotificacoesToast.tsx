import React from 'react';
import { useNotificacoesStore } from '@/shared/states/useNotificacoesStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import './NotificacoesToast.css';

export const NotificacoesToast: React.FC = () => {
  const { notificacoes, removerNotificacao } = useNotificacoesStore();

  if (notificacoes.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {notificacoes.map((item) => {
        let Icone = CheckCircle2;
        let corIcone = '#10b981';

        if (item.tipo === 'erro') {
          Icone = AlertCircle;
          corIcone = '#f43f5e';
        } else if (item.tipo === 'aviso') {
          Icone = AlertTriangle;
          corIcone = '#f59e0b';
        } else if (item.tipo === 'info') {
          Icone = Info;
          corIcone = '#3b82f6';
        }

        return (
          <div key={item.id} className={`toast-item ${item.tipo}`} role="alert">
            <div className="toast-icone">
              <Icone size={18} color={corIcone} />
            </div>
            <div className="toast-corpo">
              {item.titulo && <div className="toast-titulo">{item.titulo}</div>}
              <div className="toast-mensagem">{item.mensagem}</div>
            </div>
            <button
              className="toast-fechar"
              onClick={() => removerNotificacao(item.id)}
              aria-label="Fechar notificação"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
