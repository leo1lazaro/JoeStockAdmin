import React, { useState } from 'react';
import {
  Home,
  CreditCard,
  FileText,
  Layers,
  Tags,
  Sparkles,
  Users,
  Layers3,
  Languages,
  BadgeCheck,
  Boxes,
  Search,
  SidebarClose,
  ChevronDown,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePainelStore, MenuNavegacao } from '@/shared/states/usePainelStore';
import './BarraLateral.css';

export const BarraLateral: React.FC = () => {
  const { menuAtivo, definirMenuAtivo, termoBusca, definirTermoBusca, alternarSidebar } = usePainelStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const rotaCadastroCarta = ['/admin/tipos-carta', '/admin/disciplinas', '/admin/clas', '/admin/precons', '/admin/idiomas', '/admin/estados'].includes(pathname);
  const [cadastrosCartaAbertos, setCadastrosCartaAbertos] = useState(pathname.startsWith('/admin/cartas') || rotaCadastroCarta);

  const ativoNoPainel = (menu: MenuNavegacao) => pathname === '/admin' && menuAtivo === menu;

  const irParaPainel = (menu: MenuNavegacao) => {
    setCadastrosCartaAbertos(false);
    definirMenuAtivo(menu);
    navigate('/admin');
  };

  const irParaRota = (menu: MenuNavegacao, rota: string) => {
    setCadastrosCartaAbertos(rota.startsWith('/admin/cartas') || ['/admin/tipos-carta', '/admin/disciplinas', '/admin/clas', '/admin/precons', '/admin/idiomas', '/admin/estados'].includes(rota));
    definirMenuAtivo(menu);
    navigate(rota);
  };

  const alternarMenuCartas = () => {
    definirMenuAtivo('cards');
    setCadastrosCartaAbertos((aberto) => !aberto);
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
          className={`card-nav-acao ${pathname.startsWith('/admin/cartas') || rotaCadastroCarta ? 'ativo' : ''}`}
          onClick={alternarMenuCartas}
          aria-expanded={cadastrosCartaAbertos}
          aria-controls="cadastros-cartas-sidebar"
        >
          <div className="card-nav-icone">
            <CreditCard size={18} />
          </div>
          <span>Cartas</span>
          <ChevronDown className={`cartas-cadastros-seta ${cadastrosCartaAbertos ? 'aberta' : ''}`} size={15} />
        </button>

        {cadastrosCartaAbertos && (
          <nav id="cadastros-cartas-sidebar" className="cartas-cadastros-sidebar" aria-label="Cadastros de cartas">
            <button className={`item-config-sidebar ${pathname === '/admin/cartas' ? 'ativo' : ''}`} onClick={() => irParaRota('cards', '/admin/cartas')}>
              <span className="item-config-icone"><CreditCard size={16} /></span><span>Cadastro</span>
            </button>
            <button className={`item-config-sidebar ${pathname === '/admin/tipos-carta' ? 'ativo' : ''}`} onClick={() => irParaRota('card_types', '/admin/tipos-carta')}>
              <span className="item-config-icone"><Tags size={16} /></span><span>Tipos de carta</span>
            </button>
            <button className={`item-config-sidebar ${pathname === '/admin/disciplinas' ? 'ativo' : ''}`} onClick={() => irParaRota('disciplines', '/admin/disciplinas')}>
              <span className="item-config-icone"><Sparkles size={16} /></span><span>Disciplinas</span>
            </button>
            <button className={`item-config-sidebar ${pathname === '/admin/clas' ? 'ativo' : ''}`} onClick={() => irParaRota('classifications', '/admin/clas')}>
              <span className="item-config-icone"><Users size={16} /></span><span>Clãs</span>
            </button>
            <button className={`item-config-sidebar ${pathname === '/admin/precons' ? 'ativo' : ''}`} onClick={() => irParaRota('groups', '/admin/precons')}>
              <span className="item-config-icone"><Layers3 size={16} /></span><span>Precons</span>
            </button>
            <button className={`item-config-sidebar ${pathname === '/admin/idiomas' ? 'ativo' : ''}`} onClick={() => irParaRota('languages', '/admin/idiomas')}>
              <span className="item-config-icone"><Languages size={16} /></span><span>Idiomas</span>
            </button>
            <button className={`item-config-sidebar ${pathname === '/admin/estados' ? 'ativo' : ''}`} onClick={() => irParaRota('card_states', '/admin/estados')}>
              <span className="item-config-icone"><BadgeCheck size={16} /></span><span>Estados</span>
            </button>
          </nav>
        )}

        <button
          className={`card-nav-acao ${pathname === '/admin/estoque' ? 'ativo' : ''}`}
          onClick={() => irParaRota('inventory', '/admin/estoque')}
        >
          <div className="card-nav-icone"><Boxes size={18} /></div>
          <span>Estoque</span>
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
          onClick={() => { setCadastrosCartaAbertos(false); navigate('/admin/pedidos'); }}
        >
          <div className="card-nav-icone">
            <Layers size={18} />
          </div>
          <span>Pedidos</span>
        </button>

        <button
          className={`card-nav-acao ${pathname === '/admin/clientes' ? 'ativo' : ''}`}
          onClick={() => { setCadastrosCartaAbertos(false); navigate('/admin/clientes'); }}
        >
          <div className="card-nav-icone">
            <Tags size={18} />
          </div>
          <span>Clientes</span>
        </button>
      </div>

    </aside>
  );
};
