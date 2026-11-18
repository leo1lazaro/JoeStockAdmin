import React from 'react';
import {
  Home,
  CreditCard,
  FileText,
  Layers,
  BookOpen,
  Tags,
  Sparkles,
  Languages,
  BadgeCheck,
  ListFilter,
  Search,
  SidebarClose,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePainelStore, MenuNavegacao } from '@/shared/states/usePainelStore';
import './BarraLateral.css';

export const BarraLateral: React.FC = () => {
  const { menuAtivo, definirMenuAtivo, termoBusca, definirTermoBusca, alternarSidebar } = usePainelStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const ativoNoPainel = (menu: MenuNavegacao) => pathname === '/admin' && menuAtivo === menu;

  const irParaPainel = (menu: MenuNavegacao) => {
    definirMenuAtivo(menu);
    navigate('/admin');
  };

  const irParaRota = (menu: MenuNavegacao, rota: string) => {
    definirMenuAtivo(menu);
    navigate(rota);
  };

  return (
    <aside className="barra-lateral" aria-label="Navegação Principal">
      {/* Topo com Logo e Botão de Alternar */}
      <div className="barra-lateral-topo">
        <div className="logo-21x0">
          <span>JoeStock</span>
        </div>
        <button
          className="btn-colapso-sidebar"
          onClick={alternarSidebar}
          aria-label="Alternar painel lateral"
          title="Recolher / Expandir barra lateral"
        >
          <SidebarClose size={18} />
        </button>
      </div>

      {/* Caixa de Busca */}
      <div className="caixa-busca-sidebar">
        <Search size={15} color="var(--cor-texto-mutado)" />
        <input
          type="text"
          placeholder="Buscar..."
          value={termoBusca}
          onChange={(e) => definirTermoBusca(e.target.value)}
        />
      </div>

      {/* Áreas principais do catálogo */}
      <div className="grid-navegacao-acoes">
        <button
          className={`card-nav-acao ${ativoNoPainel('overview') ? 'ativo' : ''}`}
          onClick={() => irParaPainel('overview')}
        >
          <div className="card-nav-icone">
            <Home size={18} />
          </div>
          <span>Visão geral</span>
        </button>

        <button
          className={`card-nav-acao ${pathname.startsWith('/admin/cartas') ? 'ativo' : ''}`}
          onClick={() => irParaRota('cards', '/admin/cartas')}
        >
          <div className="card-nav-icone">
            <CreditCard size={18} />
          </div>
          <span>Cartas</span>
        </button>

        <button
          className={`card-nav-acao ${pathname === '/admin/banners' ? 'ativo' : ''}`}
          onClick={() => irParaRota('banners', '/admin/banners')}
        >
          <div className="card-nav-icone">
            <FileText size={18} />
          </div>
          <span>Banners</span>
        </button>

        <button
          className={`card-nav-acao ${pathname === '/admin/pedidos' ? 'ativo' : ''}`}
          onClick={() => navigate('/admin/pedidos')}
        >
          <div className="card-nav-icone">
            <Layers size={18} />
          </div>
          <span>Pedidos</span>
        </button>

        <button
          className={`card-nav-acao ${pathname === '/admin/produtos' ? 'ativo' : ''}`}
          onClick={() => navigate('/admin/produtos')}
        >
          <div className="card-nav-icone">
            <BookOpen size={18} />
          </div>
          <span>Produtos</span>
        </button>

        <button
          className={`card-nav-acao ${pathname === '/admin/clientes' ? 'ativo' : ''}`}
          onClick={() => navigate('/admin/clientes')}
        >
          <div className="card-nav-icone">
            <Tags size={18} />
          </div>
          <span>Clientes</span>
        </button>
      </div>

      {/* Metadados do catálogo */}
      <div className="lista-configuracoes-sidebar">
        <button
          className={`item-config-sidebar ${pathname === '/admin/tipos-carta' ? 'ativo' : ''}`}
          onClick={() => irParaRota('card_types', '/admin/tipos-carta')}
        >
          <span className="item-config-icone">
            <Tags size={16} />
          </span>
          <span>Tipos de carta</span>
        </button>

        <button
          className={`item-config-sidebar ${pathname === '/admin/disciplinas' ? 'ativo' : ''}`}
          onClick={() => irParaRota('disciplines', '/admin/disciplinas')}
        >
          <span className="item-config-icone">
            <Sparkles size={16} />
          </span>
          <span>Disciplinas</span>
        </button>

        <button
          className={`item-config-sidebar ${pathname === '/admin/idiomas' ? 'ativo' : ''}`}
          onClick={() => irParaRota('languages', '/admin/idiomas')}
        >
          <span className="item-config-icone">
            <Languages size={16} />
          </span>
          <span>Idiomas</span>
        </button>

        <button
          className={`item-config-sidebar ${pathname === '/admin/estados' ? 'ativo' : ''}`}
          onClick={() => irParaRota('card_states', '/admin/estados')}
        >
          <span className="item-config-icone">
            <BadgeCheck size={16} />
          </span>
          <span>Estados</span>
        </button>

        <button
          className={`item-config-sidebar ${pathname === '/admin/estoque' ? 'ativo' : ''}`}
          onClick={() => navigate('/admin/estoque')}
        >
          <span className="item-config-icone">
            <ListFilter size={16} />
          </span>
          <span>Estoque</span>
        </button>
      </div>
    </aside>
  );
};
