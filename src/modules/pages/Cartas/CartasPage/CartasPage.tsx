import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, CreditCard, FilterX, Pencil, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Botao } from '@/shared/components/Botao/Botao';
import { Select } from '@/shared/components/Select/Select';
import { extrairMensagemErro } from '@/modules/pages/Catalogos/api/catalogosApi';
import {
  FILTROS_CARTAS_INICIAIS,
  FiltroOpcao,
  FiltrosCartas,
  useListarFiltrosCartas,
  useListarCartas,
} from '../api/cartasApi';
import '@/modules/pages/Catalogos/components/CatalogoPage/CatalogoPage.css';
import './CartasPage.css';

const TAMANHOS_PAGINA = [10, 20, 50, 100];

function opcoesDe(lista: FiltroOpcao[] | undefined, rotuloTodos: string) {
  return [{ valor: 0, rotulo: rotuloTodos }, ...(lista ?? []).map((i) => ({ valor: i.id, rotulo: i.nome }))];
}

const ehCripta = (tipo: number | string) => tipo === 2 || String(tipo).toUpperCase() === 'CRIPTA';

export const CartasPage: React.FC = () => {
  const navegar = useNavigate();
  const [filtros, setFiltros] = useState<FiltrosCartas>(FILTROS_CARTAS_INICIAIS);
  const [busca, setBusca] = useState('');
  const { data, isLoading, isError, error, isFetching, refetch } = useListarCartas(filtros);
  const consultaFiltros = useListarFiltrosCartas();

  useEffect(() => {
    const espera = setTimeout(() => {
      setFiltros((atual) => (atual.termo === busca ? atual : { ...atual, termo: busca, pagina: 1 }));
    }, 400);
    return () => clearTimeout(espera);
  }, [busca]);

  const alterar = <K extends keyof FiltrosCartas>(campo: K, valor: FiltrosCartas[K]) =>
    setFiltros((atual) => ({ ...atual, [campo]: valor, pagina: campo === 'pagina' ? (valor as number) : 1 }));

  const alterarTipo = (tipo: number) =>
    setFiltros((atual) => ({ ...atual, tipo, tipoCartaId: 0, clasId: 0, grupo: 0, pagina: 1 }));

  const limpar = () => {
    setBusca('');
    setFiltros(FILTROS_CARTAS_INICIAIS);
  };

  const filtrosAtivos =
    !!filtros.termo ||
    [filtros.tipo, filtros.tipoCartaId, filtros.clasId, filtros.disciplinaId, filtros.idiomaId, filtros.estadoId, filtros.grupo].some(
      Boolean,
    );

  const opcoes = consultaFiltros.data;
  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / data.tamanhoPagina)) : 1;
  const cartas = data?.cartas ?? [];

  const opcoesGrupo = useMemo(
    () => [{ valor: 0, rotulo: 'Todos os grupos' }, ...(opcoes?.grupos ?? []).map((g) => ({ valor: g, rotulo: `Grupo ${g}` }))],
    [opcoes?.grupos],
  );

  return (
    <div className="pagina-catalogo">
      <div className="pagina-catalogo-cabecalho">
        <div className="pagina-catalogo-titulo-bloco">
          <div className="pagina-catalogo-icone">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="pagina-catalogo-titulo">Cartas</h2>
            <p className="pagina-catalogo-descricao">Gerencie cartas do jogo, cartas comerciais, preços e estoque.</p>
          </div>
        </div>
        <Botao variante="primario" icone={<Plus size={16} />} onClick={() => navegar('/admin/cartas/nova')}>
          Nova carta
        </Botao>
      </div>

      <div className="card-catalogo">
        <div className="cartas-filtros">
          <div className="catalogo-busca cartas-filtro-busca">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar por nome ou texto da carta"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <Select
            rotuloAcessivel="Tipo"
            valor={filtros.tipo}
            opcoes={opcoesDe(opcoes?.tipos, 'Library e Cripta')}
            aoAlterar={alterarTipo}
          />
          {filtros.tipo !== 3 && <>
          <Select
            rotuloAcessivel="Tipo de carta"
            valor={filtros.tipoCartaId}
            opcoes={opcoesDe(opcoes?.tiposCarta, 'Todos os tipos de carta')}
            aoAlterar={(v) => alterar('tipoCartaId', v)}
          />
          {filtros.tipo !== 1 && (
            <Select
              rotuloAcessivel="Clã"
              valor={filtros.clasId}
              opcoes={opcoesDe(opcoes?.clas, 'Todos os clãs')}
              aoAlterar={(v) => alterar('clasId', v)}
            />
          )}
          <Select
            rotuloAcessivel="Disciplina"
            valor={filtros.disciplinaId}
            opcoes={opcoesDe(opcoes?.disciplinas, 'Todas as disciplinas')}
            aoAlterar={(v) => alterar('disciplinaId', v)}
          />
          <Select
            rotuloAcessivel="Idioma"
            valor={filtros.idiomaId}
            opcoes={opcoesDe(opcoes?.idiomas, 'Todos os idiomas')}
            aoAlterar={(v) => alterar('idiomaId', v)}
          />
          <Select
            rotuloAcessivel="Estado"
            valor={filtros.estadoId}
            opcoes={opcoesDe(opcoes?.estados, 'Todos os estados')}
            aoAlterar={(v) => alterar('estadoId', v)}
          />
          {filtros.tipo !== 1 && (
            <Select
              rotuloAcessivel="Grupo"
              valor={filtros.grupo}
              opcoes={opcoesGrupo}
              aoAlterar={(v) => alterar('grupo', v)}
            />
          )}
          </>}

          <Botao variante="fantasma" onClick={limpar} disabled={!filtrosAtivos}>
            <FilterX size={15} /> Limpar filtros
          </Botao>
        </div>

        <div className="catalogo-ferramentas">
          <span className="catalogo-contador">
            {data ? `${data.total} ${data.total === 1 ? 'carta' : 'cartas'}` : ''}
            {isFetching && !isLoading ? ' • atualizando...' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="catalogo-estado">Carregando cartas...</div>
        ) : isError ? (
          <div className="catalogo-estado catalogo-estado-erro">
            <AlertCircle size={20} />
            {extrairMensagemErro(error)}
            <Botao variante="secundario" onClick={() => refetch()}>
              Tentar novamente
            </Botao>
          </div>
        ) : cartas.length === 0 ? (
          <div className="catalogo-estado">Nenhuma carta encontrada para os filtros informados.</div>
        ) : (
          <div className="catalogo-tabela-wrapper">
            <table className="catalogo-tabela">
              <thead>
                <tr>
                  <th>Carta</th>
                  <th>Tipo</th>
                  <th>Texto / descrição</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th className="catalogo-coluna-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cartas.map((carta) => (
                  <tr key={carta.id}>
                    <td>
                      <div className="carta-celula-nome">
                        {carta.imagemUrl ? (
                          <img className="carta-miniatura" src={carta.imagemUrl} alt="" loading="lazy" />
                        ) : (
                          <div className="carta-miniatura carta-miniatura-vazia">
                            <CreditCard size={16} />
                          </div>
                        )}
                        <div>
                          <strong>{carta.nome}</strong>
                          {carta.nomeImpresso && carta.nomeImpresso !== carta.nome && (
                            <small>{carta.nomeImpresso}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`catalogo-selo ${ehCripta(carta.tipo) ? '' : 'catalogo-selo-sucesso'}`}>
                        {Number(carta.tipo) === 3 ? carta.categoria : ehCripta(carta.tipo) ? 'Cripta' : 'Library'}
                      </span>
                    </td>
                    <td className="carta-texto">{carta.textoCarta}</td>
                    <td>{carta.preco == null ? '—' : `R$ ${carta.preco.toFixed(2)}`}</td>
                    <td>{carta.estoque}</td>
                    <td className="catalogo-coluna-acoes">
                      <button
                        className="catalogo-btn-acao"
                        onClick={() => navegar('/admin/cartas/editar', { state: { id: carta.id } })}
                        aria-label={`Editar ${carta.nome}`}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > 0 && (
          <div className="cartas-paginacao">
            <div className="cartas-paginacao-tamanho">
              <span>Por página</span>
              <Select
                rotuloAcessivel="Itens por página"
                valor={filtros.tamanhoPagina}
                opcoes={TAMANHOS_PAGINA.map((t) => ({ valor: t, rotulo: String(t) }))}
                aoAlterar={(v) => alterar('tamanhoPagina', v)}
              />
            </div>
            <div className="cartas-paginacao-navegacao">
              <button
                className="catalogo-btn-acao"
                onClick={() => alterar('pagina', filtros.pagina - 1)}
                disabled={filtros.pagina <= 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Página {data.pagina} de {totalPaginas}
              </span>
              <button
                className="catalogo-btn-acao"
                onClick={() => alterar('pagina', filtros.pagina + 1)}
                disabled={filtros.pagina >= totalPaginas}
                aria-label="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
