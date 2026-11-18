import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Dados de mock padrão do Dashboard 21X0 idênticos ao design de referência
 */
export const DADOS_MOCK_DASHBOARD = {
  usuario: {
    nome: 'Alvie',
    saudacao: 'Good Morning, Alvie',
    dataAtual: 'Friday, 15 July 2026',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  metricas: [
    {
      id: 'metrica-saldo',
      titulo: 'Total Balance',
      valor: 5465.00,
      porcentagemVariacao: 6.3,
      tipoVariacao: 'alta' as const,
      pontosGrafico: [20, 35, 25, 45, 30, 60, 50, 75, 65, 80],
    },
    {
      id: 'metrica-receita',
      titulo: 'Total Income',
      valor: 8395.00,
      porcentagemVariacao: 7.1,
      tipoVariacao: 'alta' as const,
      pontosGrafico: [30, 40, 35, 55, 45, 70, 60, 85, 75, 90],
    },
    {
      id: 'metrica-despesas',
      titulo: 'Total Expenses',
      valor: 2455.00,
      porcentagemVariacao: -5.7,
      tipoVariacao: 'baixa' as const,
      pontosGrafico: [60, 50, 65, 40, 55, 35, 45, 25, 35, 20],
    },
    {
      id: 'metrica-poupanca',
      titulo: 'Total Savings',
      valor: 4320.00,
      porcentagemVariacao: 5.2,
      tipoVariacao: 'alta' as const,
      pontosGrafico: [25, 30, 45, 40, 50, 65, 55, 70, 80, 85],
    },
  ],
  cartoes: [
    {
      id: 'card-platinum',
      tipo: 'platinum' as const,
      titulo: 'Platinum Card',
      numeroMascara: '•••• 4821',
      limiteDisponivel: 15000,
      gastosAtuais: 3200,
      bandeira: 'mastercard' as const,
      corGradiente: 'linear-gradient(135deg, #e4e7eb 0%, #cbd2dc 100%)',
      taxaMensal: '$150/mo',
      posicaoOffset: -160,
    },
    {
      id: 'card-debit-1',
      tipo: 'debit' as const,
      titulo: 'Debit Card',
      numeroMascara: '•••• 9140',
      limiteDisponivel: 6800,
      gastosAtuais: 1450,
      bandeira: 'visa' as const,
      corGradiente: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)',
      posicaoOffset: -80,
    },
    {
      id: 'card-gpay-gold',
      tipo: 'credit' as const,
      titulo: 'Credit Card',
      numeroMascara: '•••• 7749',
      limiteDisponivel: 25000,
      gastosAtuais: 4699,
      bandeira: 'gpay' as const,
      corGradiente: 'linear-gradient(135deg, #fbf7ee 0%, #f4e8cc 50%, #e7d5af 100%)',
      posicaoOffset: 0,
      emDestaque: true,
    },
    {
      id: 'card-stripe',
      tipo: 'credit' as const,
      titulo: 'Stripe Card',
      numeroMascara: '•••• 3302',
      limiteDisponivel: 12000,
      gastosAtuais: 1890,
      bandeira: 'stripe' as const,
      corGradiente: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
      posicaoOffset: 80,
    },
    {
      id: 'card-applepay',
      tipo: 'credit' as const,
      titulo: 'Apple Card',
      numeroMascara: '•••• 8820',
      limiteDisponivel: 20000,
      gastosAtuais: 2450,
      bandeira: 'applepay' as const,
      corGradiente: 'linear-gradient(135deg, #fafafa 0%, #f1f3f5 100%)',
      posicaoOffset: 160,
    },
    {
      id: 'card-silver',
      tipo: 'silver' as const,
      titulo: 'Silver Card',
      numeroMascara: '•••• 1204',
      limiteDisponivel: 8000,
      gastosAtuais: 890,
      bandeira: 'visa' as const,
      corGradiente: 'linear-gradient(135deg, #f1f3f6 0%, #e1e5eb 100%)',
      taxaMensal: '$130/mo',
      posicaoOffset: 240,
    },
  ],
  graficoEspelho: {
    totalRenda: 578395.00,
    totalDespesas: 578395.00,
    destaqueValor: 4699.00,
    mesDestaque: 'Apr',
    meses: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    dadosMeses: [
      { mes: 'Jan', renda: 30, despesa: 28 },
      { mes: 'Feb', renda: 50, despesa: 45 },
      { mes: 'Mar', renda: 70, despesa: 65 },
      { mes: 'Apr', renda: 100, despesa: 100, destaque: true },
      { mes: 'May', renda: 65, despesa: 60 },
      { mes: 'Jun', renda: 45, despesa: 40 },
      { mes: 'Jul', renda: 25, despesa: 25 },
    ],
  },
  gastosSemanais: {
    porcentagemBreakdown: 56.07,
    porcentagemShopping: 47.93,
    textoTotalSpend: '42% of total spend',
  },
  visaoMensal: {
    porcentagemPico: 8.2,
    meses: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  },
  transacoes: [
    {
      id: 'trans_1',
      empresa: 'Starbucks',
      categoria: 'Food & Drink',
      data: 'Nov 12, 26',
      valor: 515.75,
      tipo: 'receita' as const,
      tipoLabel: 'Income',
      icone: 'starbucks',
    },
    {
      id: 'trans_2',
      empresa: 'Netflix',
      categoria: 'Entertainment',
      data: 'Nov 12, 26',
      valor: -59.99,
      tipo: 'despesa' as const,
      tipoLabel: 'Transfer',
      icone: 'netflix',
    },
    {
      id: 'trans_3',
      empresa: 'Apple Store',
      categoria: 'Electronics',
      data: 'Nov 12, 26',
      valor: -75.99,
      tipo: 'despesa' as const,
      tipoLabel: 'Transfer',
      icone: 'apple',
    },
    {
      id: 'trans_4',
      empresa: 'Slack',
      categoria: 'Electronics',
      data: 'Nov 12, 26',
      valor: -59.99,
      tipo: 'despesa' as const,
      tipoLabel: 'Transfer',
      icone: 'slack',
    },
  ],
};

/**
 * Cliente HTTP Axios configurado para chamadas do projeto
 */
export const clienteApi = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Adapter interceptor simulado para responder às chamadas da API usando Axios
clienteApi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.url?.startsWith('/admin/')) {
    config.headers.set('X-Admin-Request', '1');
  }

  return config;
});

let transacoesEmMemoria = [...DADOS_MOCK_DASHBOARD.transacoes];

clienteApi.interceptors.response.use(
  (resposta) => resposta,
  async (erro) => {
    const config = erro.config;
    // Se a chamada for para nossos endpoints simulados, responder via axios mock
    if (config?.url?.includes('/dashboard/dados')) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        data: {
          ...DADOS_MOCK_DASHBOARD,
          transacoes: transacoesEmMemoria,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse;
    }

    if (config?.url?.includes('/transacoes')) {
      if (config.method === 'post') {
        const novaTransacao = JSON.parse(config.data);
        novaTransacao.id = `trans_${Date.now()}`;
        transacoesEmMemoria = [novaTransacao, ...transacoesEmMemoria];
        await new Promise((r) => setTimeout(r, 250));
        return {
          data: novaTransacao,
          status: 201,
          statusText: 'Created',
          headers: {},
          config,
        } as AxiosResponse;
      }

      await new Promise((r) => setTimeout(r, 150));
      return {
        data: transacoesEmMemoria,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse;
    }

    if (config?.url?.includes('/transferir')) {
      await new Promise((r) => setTimeout(r, 300));
      return {
        data: { sucesso: true, mensagem: 'Transferência enviada com sucesso!' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse;
    }

    return Promise.reject(erro);
  }
);
