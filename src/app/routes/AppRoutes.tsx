import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route, RouterProvider } from 'react-router-dom';
import { AdminLoginPage } from '@/modules/pages/AdminLogin/AdminLoginPage';
import { VisaoGeralPage } from '@/modules/pages/Comercio/VisaoGeralPage';
import { PedidosPage } from '@/modules/pages/Comercio/PedidosPage';
import { ClientesPage } from '@/modules/pages/Comercio/ClientesPage';
import { TiposCartaPage } from '@/modules/pages/Catalogos/TiposCartaPage/TiposCartaPage';
import { DisciplinasPage } from '@/modules/pages/Catalogos/DisciplinasPage/DisciplinasPage';
import { ClasPage } from '@/modules/pages/Catalogos/ClasPage/ClasPage';
import { PreconsPage } from '@/modules/pages/Catalogos/PreconsPage/PreconsPage';
import { IdiomasPage } from '@/modules/pages/Catalogos/IdiomasPage/IdiomasPage';
import { EstadosPage } from '@/modules/pages/Catalogos/EstadosPage/EstadosPage';
import { BannersPage } from '@/modules/pages/Catalogos/BannersPage/BannersPage';
import { CartasPage } from '@/modules/pages/Cartas/CartasPage/CartasPage';
import { CartaFormPage } from '@/modules/pages/Cartas/CartaFormPage/CartaFormPage';
import { EstoquePage } from '@/modules/pages/Comercio/EstoquePage';
import { AppLayout } from '@/app/layout/AppLayout';
import { RotaAdminProtegida } from './RotaAdminProtegida';

const LayoutAdmin: React.FC = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

/**
 * Mapeador de rotas e páginas da aplicação
 */
const router = createBrowserRouter(createRoutesFromElements(
      <>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RotaAdminProtegida />}>
          <Route element={<LayoutAdmin />}>
            <Route path="/admin" element={<VisaoGeralPage />} />
            <Route path="/admin/produtos" element={<Navigate to="/admin/cartas" replace />} />
            <Route path="/admin/estoque" element={<EstoquePage />} />
            <Route path="/admin/pedidos" element={<PedidosPage />} />
            <Route path="/admin/clientes" element={<ClientesPage />} />
            <Route path="/admin/cartas" element={<CartasPage />} />
            <Route path="/admin/cartas/nova" element={<CartaFormPage />} />
            <Route path="/admin/cartas/editar" element={<CartaFormPage />} />
            <Route path="/admin/banners" element={<BannersPage />} />
            <Route path="/admin/tipos-carta" element={<TiposCartaPage />} />
            <Route path="/admin/disciplinas" element={<DisciplinasPage />} />
            <Route path="/admin/clas" element={<ClasPage />} />
            <Route path="/admin/precons" element={<PreconsPage />} />
            <Route path="/admin/idiomas" element={<IdiomasPage />} />
            <Route path="/admin/estados" element={<EstadosPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </>
));

export const AppRoutes: React.FC = () => <RouterProvider router={router} />;
