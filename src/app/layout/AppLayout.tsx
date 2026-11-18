import React from 'react';
import { useSessaoAdmin } from '@/app/auth/adminAuthApi';
import { NotificacoesToast } from '@/shared/components/NotificacoesToast/NotificacoesToast';
import { BarraLateral } from './components/BarraLateral/BarraLateral';
import { BarraSuperior } from './components/BarraSuperior/BarraSuperior';
import './AppLayout.css';

interface PropriedadesAppLayout {
  children: React.ReactNode;
}

export const AppLayout: React.FC<PropriedadesAppLayout> = ({ children }) => {
  const { data: sessaoAdmin } = useSessaoAdmin();

  return (
    <div className="app-layout-base">
      <main className="moldura-dashboard-central">
        <BarraLateral />
        <section className="conteudo-principal-painel">
          <BarraSuperior
            saudacao={sessaoAdmin ? `Olá, ${sessaoAdmin.nome}` : 'Painel JoeStock'}
            nomeUsuario={sessaoAdmin?.nome}
          />
          <div className="conteudo-rota-dashboard">{children}</div>
        </section>
      </main>
      <NotificacoesToast />
    </div>
  );
};
