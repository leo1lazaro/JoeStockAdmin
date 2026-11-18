import { Link } from 'react-router-dom';
import { moeda, statusPedido, usePedidos, useProdutos } from './api/comercioApi';
import { EstruturaGestao, EstadoGestao } from './components/EstruturaGestao';
export function VisaoGeralPage() {
  const produtos = useProdutos(); const pedidos = usePedidos();
  const vendas = (pedidos.data ?? []).filter((pedido) => pedido.status === 'concluido');
  return <EstruturaGestao titulo="Visão geral da loja" descricao="Catálogo, estoque e pedidos da JoeStock em um só lugar.">
    <EstadoGestao carregando={produtos.isPending || pedidos.isPending} erro={produtos.isError || pedidos.isError} repetir={() => { void produtos.refetch(); void pedidos.refetch(); }} />
    {produtos.isSuccess && pedidos.isSuccess && <><div className="Comercio-metricas">
      {[['Produtos publicados', produtos.data.filter((item) => item.ativo).length], ['Pedidos aguardando', pedidos.data.filter((item) => item.status === 'aguardando').length], ['Estoque baixo', produtos.data.filter((item) => item.ativo && item.estoque <= 5).length], ['Vendas concluídas', moeda(vendas.reduce((total, item) => total + item.total, 0))]].map(([titulo, valor]) => <article className="Comercio-metrica" key={titulo}><span>{titulo}</span><strong>{valor}</strong></article>)}
    </div><nav className="Comercio-atalhos"><Link to="/admin/produtos">Gerenciar produtos →</Link><Link to="/admin/estoque">Conferir estoque →</Link><Link to="/admin/pedidos">Atender pedidos →</Link></nav>
    <section className="Comercio-card"><h2>Pedidos recentes</h2><div className="Comercio-tabela-container"><table className="Comercio-tabela"><thead><tr><th>Pedido</th><th>Cliente</th><th>Situação</th><th>Total</th></tr></thead><tbody>{pedidos.data.slice(0, 8).map((pedido) => <tr key={pedido.id}><td><Link to="/admin/pedidos">#{pedido.id}</Link></td><td>{pedido.nome}</td><td>{statusPedido[pedido.status]}</td><td>{moeda(pedido.total)}</td></tr>)}{!pedidos.data.length && <tr><td colSpan={4}>Os pedidos enviados pela loja aparecerão aqui.</td></tr>}</tbody></table></div></section></>}
  </EstruturaGestao>;
}
