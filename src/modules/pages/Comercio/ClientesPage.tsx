import { useState } from 'react';
import { CampoFormulario } from '@/shared/components/CampoFormulario/CampoFormulario';
import { moeda, usePedidos } from './api/comercioApi';
import { EstruturaGestao, EstadoGestao } from './components/EstruturaGestao';
export function ClientesPage() {
  const consulta = usePedidos(); const [busca, definirBusca] = useState('');
  const clientes = new Map<string, { nome: string; email: string; telefone: string; pedidos: number; total: number }>();
  for (const pedido of consulta.data ?? []) {
    const cliente = clientes.get(pedido.email) ?? { nome: pedido.nome, email: pedido.email, telefone: pedido.telefone, pedidos: 0, total: 0 };
    cliente.pedidos++; if (pedido.status === 'concluido') cliente.total += pedido.total; clientes.set(pedido.email, cliente);
  }
  const itens = [...clientes.values()].filter((item) => `${item.nome} ${item.email}`.toLowerCase().includes(busca.toLowerCase()));
  return <EstruturaGestao titulo="Clientes" descricao="Contatos dos clientes que enviaram pedidos à JoeStock, agrupados por e-mail.">
    <CampoFormulario rotulo="Buscar cliente" type="search" value={busca} onChange={(e) => definirBusca(e.target.value)} />
    <EstadoGestao carregando={consulta.isPending} erro={consulta.isError} repetir={() => void consulta.refetch()} />
    {consulta.isSuccess && <section className="Comercio-card Comercio-tabela-container"><table className="Comercio-tabela"><thead><tr><th>Cliente</th><th>Contato</th><th>Pedidos</th><th>Compras concluídas</th></tr></thead><tbody>{itens.map((item) => <tr key={item.email}><td>{item.nome}</td><td><a href={`mailto:${item.email}`}>{item.email}</a><small>{item.telefone}</small></td><td>{item.pedidos}</td><td>{moeda(item.total)}</td></tr>)}{!itens.length && <tr><td colSpan={4}>Nenhum cliente encontrado.</td></tr>}</tbody></table></section>}
  </EstruturaGestao>;
}
