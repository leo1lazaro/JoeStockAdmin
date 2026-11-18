import React from 'react';
import { isAxiosError } from 'axios';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSessaoAdmin } from '@/app/auth/adminAuthApi';

export const RotaAdminProtegida: React.FC = () => {
  const sessao = useSessaoAdmin();
  const location = useLocation();

  if (sessao.isPending) {
    return (
      <div className="estado-autenticacao" role="status">
        Verificando acesso administrativo...
      </div>
    );
  }

  if (sessao.isError) {
    const status = isAxiosError(sessao.error) ? sessao.error.response?.status : undefined;
    if (status === 401) {
      return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    if (status === 403) {
      return (
        <div className="estado-autenticacao" role="alert">
          <p>A sessão foi reconhecida, mas esta conta não tem permissão para acessar a administração.</p>
        </div>
      );
    }

    return (
      <div className="estado-autenticacao" role="alert">
        <p>Não foi possível verificar sua sessão. Verifique a conexão e tente novamente.</p>
        <button type="button" onClick={() => void sessao.refetch()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return <Outlet />;
};
