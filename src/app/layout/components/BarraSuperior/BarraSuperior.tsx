import React from 'react';
import { Package, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/shared/components/Avatar/Avatar';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';
import { useLogoutAdmin } from '@/app/auth/adminAuthApi';
import './BarraSuperior.css';

interface PropriedadesBarraSuperior {
  saudacao?: string;
  dataExtensa?: string;
  nomeUsuario?: string;
}

function formatarDataAtual() {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export const BarraSuperior: React.FC<PropriedadesBarraSuperior> = ({
  saudacao = 'Painel JoeStock',
  dataExtensa = formatarDataAtual(),
  nomeUsuario = 'Administrador',
}) => {
  const toast = useNotificacaoToast();
  const logout = useLogoutAdmin();
  const navegar = useNavigate();

  const aoSair = () => {
    logout.mutate(undefined, {
      onSuccess: () => navegar('/admin/login', { replace: true }),
      onError: () => toast.erro('Não foi possível encerrar a sessão. Tente novamente.'),
    });
  };

  return (
    <header className="barra-superior">
      <div className="saudacao-bloco">
        <h1 className="saudacao-titulo">{saudacao}</h1>
        <span className="saudacao-data">{dataExtensa}</span>
      </div>

      <div className="acoes-topo">
        <button
          className="btn-pilula-acao"
          aria-label="Estoque"
          onClick={() => navegar('/admin/estoque')}
        >
          <Package size={15} />
          <span>Estoque</span>
        </button>

        <button
          className="btn-circulo-acao"
          onClick={aoSair}
          aria-label="Sair do painel administrativo"
          title="Sair"
          disabled={logout.isPending}
        >
          <LogOut size={16} />
        </button>

        <div
          onClick={() => toast.info(`Administrador ${nomeUsuario}`)}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <Avatar
            nome={nomeUsuario}
            urlImagem="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            tamanho={38}
          />
        </div>
      </div>
    </header>
  );
};
