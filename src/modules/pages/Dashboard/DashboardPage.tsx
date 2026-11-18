import React from 'react';
import { useBuscarDadosDashboard } from './hooks/hooksChamadaApi/useBuscarDadosDashboard';
import { useMetodosTransacoes } from './hooks/hooksMetodosPagina/useMetodosTransacoes';
import { useMetodosCartoes } from './hooks/hooksMetodosPagina/useMetodosCartoes';
import { CarrosselCartoes } from './components/CarrosselCartoes/CarrosselCartoes';
import { CartoesMetricas } from './components/CartoesMetricas/CartoesMetricas';
import { GraficoRendaDespesas } from './components/GraficoRendaDespesas/GraficoRendaDespesas';
import { GraficoGastosSemanais } from './components/GraficoGastosSemanais/GraficoGastosSemanais';
import { GraficoVisaoMensal } from './components/GraficoVisaoMensal/GraficoVisaoMensal';
import { ListaTransacoes } from './components/ListaTransacoes/ListaTransacoes';
import { ModalNovaTransacao } from './components/ModalNovaTransacao/ModalNovaTransacao';
import { Modal } from '@/shared/components/Modal/Modal';
import { Botao } from '@/shared/components/Botao/Botao';
import './styles/DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const { data: dadosDashboard } = useBuscarDadosDashboard();
  const {
    modalPinAberto,
    pinVisualizado,
    aoFecharModalPin,
  } = useMetodosCartoes();

  const {
    transacoesFiltradas,
    modalNovaTransacaoAberto,
    abrirModalNovaTransacao,
    fecharModalNovaTransacao,
    aoSubmeterNovaTransacao,
    carregandoCriacao,
    modalTransferenciaAberto,
    fecharModalTransferencia,
    aoSubmeterTransferencia,
    carregandoTransferencia,
  } = useMetodosTransacoes(dadosDashboard?.transacoes);

  return (
    <div className="pagina-dashboard-container">
      <CarrosselCartoes cartoes={dadosDashboard?.cartoes} />

      <CartoesMetricas metricas={dadosDashboard?.metricas} />

      <div className="grade-conteudo-inferior">
        <div className="coluna-inferior-esquerda">
          <GraficoRendaDespesas
            totalRenda={dadosDashboard?.graficoEspelho?.totalRenda}
            totalDespesas={dadosDashboard?.graficoEspelho?.totalDespesas}
            destaqueValor={dadosDashboard?.graficoEspelho?.destaqueValor}
            mesesDados={dadosDashboard?.graficoEspelho?.dadosMeses}
          />
        </div>

        <div className="coluna-inferior-direita">
          <div className="linha-graficos-superiores-direita">
            <GraficoGastosSemanais
              porcentagemBreakdown={dadosDashboard?.gastosSemanais?.porcentagemBreakdown}
              porcentagemShopping={dadosDashboard?.gastosSemanais?.porcentagemShopping}
              textoTotalSpend={dadosDashboard?.gastosSemanais?.textoTotalSpend}
            />
            <GraficoVisaoMensal
              porcentagemPico={dadosDashboard?.visaoMensal?.porcentagemPico}
              meses={dadosDashboard?.visaoMensal?.meses}
            />
          </div>

          <ListaTransacoes
            transacoes={transacoesFiltradas}
            aoClicarVerTodas={abrirModalNovaTransacao}
            aoClicarNova={abrirModalNovaTransacao}
          />
        </div>
      </div>

      {/* Modais de Ação e Interação */}
      <ModalNovaTransacao
        aberto={modalNovaTransacaoAberto}
        aoFechar={fecharModalNovaTransacao}
        aoSubmeter={aoSubmeterNovaTransacao}
        carregando={carregandoCriacao}
      />

      <ModalNovaTransacao
        aberto={modalTransferenciaAberto}
        aoFechar={fecharModalTransferencia}
        aoSubmeter={aoSubmeterTransferencia as any}
        carregando={carregandoTransferencia}
      />

      {/* Modal Seguro para Exibir PIN */}
      <Modal
        aberto={modalPinAberto}
        aoFechar={aoFecharModalPin}
        titulo="PIN Seguro do Cartão"
        rodape={
          <Botao variante="primario" onClick={aoFecharModalPin}>
            Entendido
          </Botao>
        }
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: '12px', fontSize: '13.5px' }}>
            Seu código de segurança PIN temporário de uso único:
          </p>
          <div
            className="tabular-numeros"
            style={{
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '8px',
              color: 'var(--cor-texto-titulo)',
              background: '#f1f5f9',
              padding: '12px 24px',
              borderRadius: '12px',
              display: 'inline-block',
            }}
          >
            {pinVisualizado}
          </div>
        </div>
      </Modal>
    </div>
  );
};
