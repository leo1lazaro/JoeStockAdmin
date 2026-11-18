import { useState } from 'react';
import { Botao } from '@/shared/components/Botao/Botao';
import { Modal } from '@/shared/components/Modal/Modal';
import { CampoFormulario } from '@/shared/components/CampoFormulario/CampoFormulario';
import { Select } from '@/shared/components/Select/Select';
import { extrairMensagemErro } from '../Catalogos/api/catalogosApi';
import { moeda, Pedido, statusPedido, usePedidos, useAlterarPedido } from './api/comercioApi';
import { EstruturaGestao, EstadoGestao } from './components/EstruturaGestao';
export function PedidosPage() {
  const consulta = usePedidos(); const alterar = useAlterarPedido();
  const [busca, definirBusca] = useState(''); const [status, definirStatus] = useState('todos');
  const [selecionado, selecionar] = useState<number | null>(null); const [erro, definirErro] = useState('');
  const pedido = consulta.data?.find((item) => item.id === selecionado);
  const itens = (consulta.data ?? []).filter((item) => (status === 'todos' || item.status === status) && `${item.id} ${item.nome} ${item.email}`.toLowerCase().includes(busca.toLowerCase()));
  async function atualizar(pedido: Pedido, novo: string) { try { definirErro(''); await alterar.mutateAsync({ id: pedido.id, status: novo }); } catch (falha) { definirErro(extrairMensagemErro(falha)); } }
  return <EstruturaGestao titulo="Pedidos" descricao="Confirme pedidos, combine a retirada e acompanhe as vendas." acoes={<Botao onClick={() => void consulta.refetch()}>Atualizar</Botao>}>
    <div className="Comercio-ferramentas"><CampoFormulario rotulo="Buscar número, cliente ou e-mail" value={busca} onChange={(e) => definirBusca(e.target.value)} /><Select valor={status} aoAlterar={definirStatus} rotuloAcessivel="Filtrar status" opcoes={[{ valor: 'todos', rotulo: 'Todos os status' }, ...Object.entries(statusPedido).map(([valor, rotulo]) => ({ valor, rotulo }))]} /></div>
    <EstadoGestao carregando={consulta.isPending} erro={consulta.isError} repetir={() => void consulta.refetch()} />
    {consulta.isSuccess && <section className="Comercio-card Comercio-tabela-container"><table className="Comercio-tabela"><thead><tr><th>Pedido</th><th>Cliente</th><th>Status</th><th>Total</th><th>Ações</th></tr></thead><tbody>{itens.map((item) => <tr key={item.id}><td>#{item.id}<small>{new Date(`${item.criadoEm.replace(/Z$/, '')}Z`).toLocaleDateString('pt-BR')}</small></td><td>{item.nome}<small>{item.email}</small></td><td><span className="Comercio-status">{statusPedido[item.status]}</span></td><td>{moeda(item.total)}</td><td><Botao onClick={() => { selecionar(item.id); definirErro(''); }}>Ver pedido</Botao></td></tr>)}{!itens.length && <tr><td colSpan={5}>Nenhum pedido encontrado.</td></tr>}</tbody></table></section>}
    <Modal aberto={!!pedido} aoFechar={() => { if (!alterar.isPending) selecionar(null); }} titulo={`Pedido #${pedido?.id ?? ''}`}>
      {pedido && <div className="Comercio-detalhes"><span className="Comercio-status">{statusPedido[pedido.status]}</span><p><strong>{pedido.nome}</strong><br />{pedido.email}<br />{pedido.telefone}</p>
        <p>Retirada a combinar. Pagamento confirmado manualmente pela loja.</p><p>{pedido.observacoes || 'Sem observações.'}</p>
        {pedido.itens.map((item) => <p key={item.id}>{item.quantidade} × {item.nome} — {moeda(item.quantidade * item.precoUnitario)}</p>)}<h3>Total: {moeda(pedido.total)}</h3>
        <div className="Comercio-acoes">{pedido.status === 'aguardando' && <Botao variante="primario" disabled={alterar.isPending} onClick={() => void atualizar(pedido, 'confirmado')}>Confirmar pedido</Botao>}
        {pedido.status === 'confirmado' && <Botao variante="primario" disabled={alterar.isPending} onClick={() => void atualizar(pedido, 'concluido')}>Concluir retirada</Botao>}
        {(pedido.status === 'aguardando' || pedido.status === 'confirmado') && <Botao disabled={alterar.isPending} onClick={() => void atualizar(pedido, 'cancelado')}>Cancelar e devolver estoque</Botao>}</div>
        {erro && <p role="alert">{erro}</p>}
      </div>}
    </Modal></EstruturaGestao>;
}
