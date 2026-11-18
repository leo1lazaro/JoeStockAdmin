import React from 'react';
import { Wifi } from 'lucide-react';
import { usePainelStore, CartaoItem } from '@/shared/states/usePainelStore';
import { useNotificacaoToast } from '@/shared/hooks/useNotificacaoToast';
import './CarrosselCartoes.css';

interface PropriedadesCarrosselCartoes {
  cartoes?: CartaoItem[];
}

export const CarrosselCartoes: React.FC<PropriedadesCarrosselCartoes> = ({ cartoes = [] }) => {
  const { cartaoAtivoId, definirCartaoAtivo } = usePainelStore();
  const toast = useNotificacaoToast();

  const cartoesPadrao: CartaoItem[] = cartoes.length > 0 ? cartoes : [
    {
      id: 'card-platinum',
      tipo: 'platinum',
      titulo: 'Platinum Card',
      numeroMascara: '•••• 4821',
      limiteDisponivel: 15000,
      gastosAtuais: 3200,
      bandeira: 'mastercard',
      corGradiente: 'cartao-tema-platinum',
      taxaMensal: '$150/mo',
    },
    {
      id: 'card-debit-1',
      tipo: 'debit',
      titulo: 'Debit Card',
      numeroMascara: '•••• 9140',
      limiteDisponivel: 6800,
      gastosAtuais: 1450,
      bandeira: 'visa',
      corGradiente: 'cartao-tema-debit',
    },
    {
      id: 'card-credit-1',
      tipo: 'credit',
      titulo: 'Credit Card',
      numeroMascara: '•••• 1024',
      limiteDisponivel: 18000,
      gastosAtuais: 2300,
      bandeira: 'visa',
      corGradiente: 'cartao-tema-debit',
    },
    {
      id: 'card-gpay-gold',
      tipo: 'credit',
      titulo: 'Credit Card',
      numeroMascara: '•••• 7749',
      limiteDisponivel: 25000,
      gastosAtuais: 4699,
      bandeira: 'gpay',
      corGradiente: 'cartao-tema-ouro',
    },
    {
      id: 'card-stripe',
      tipo: 'credit',
      titulo: 'Credit Card',
      numeroMascara: '•••• 3302',
      limiteDisponivel: 12000,
      gastosAtuais: 1890,
      bandeira: 'stripe',
      corGradiente: 'cartao-tema-stripe',
    },
    {
      id: 'card-applepay',
      tipo: 'credit',
      titulo: 'Credit Card',
      numeroMascara: '•••• 8820',
      limiteDisponivel: 20000,
      gastosAtuais: 2450,
      bandeira: 'applepay',
      corGradiente: 'cartao-tema-apple',
    },
    {
      id: 'card-silver',
      tipo: 'silver',
      titulo: 'Silver Card',
      numeroMascara: '•••• 1204',
      limiteDisponivel: 8000,
      gastosAtuais: 890,
      bandeira: 'visa',
      corGradiente: 'cartao-tema-silver',
      taxaMensal: '$130/mo',
    },
  ];

  const selecionarCartao = (cartao: CartaoItem) => {
    definirCartaoAtivo(cartao.id);
    toast.info(`Cartão selecionado: ${cartao.titulo} (${cartao.bandeira.toUpperCase()})`);
  };

  return (
    <div className="deck-cartoes-container" aria-label="Deck de Cartões">
      <div className="deck-cartoes-linha">
        {cartoesPadrao.map((cartao) => {
          const ehAtivo = cartao.id === cartaoAtivoId;

          return (
            <div
              key={cartao.id}
              className={`cartao-deck-item ${cartao.corGradiente} ${ehAtivo ? 'ativo' : ''}`}
              onClick={() => selecionarCartao(cartao)}
              role="button"
              tabIndex={0}
              aria-label={`Cartão ${cartao.titulo}`}
            >
              <div className="cartao-deck-topo">
                <span className="cartao-deck-tipo-texto">{cartao.titulo}</span>
                <div className="cartao-deck-brand-logo">
                  {cartao.bandeira === 'gpay' && <span>G Pay</span>}
                  {cartao.bandeira === 'applepay' && <span> Pay</span>}
                  {cartao.bandeira === 'stripe' && <span style={{ textTransform: 'lowercase' }}>stripe</span>}
                </div>
              </div>

              <div className="cartao-deck-centro">
                {ehAtivo && (
                  <div className="icone-contactless" title="Pagamento por aproximação">
                    <Wifi size={18} style={{ transform: 'rotate(90deg)' }} />
                  </div>
                )}
              </div>

              <div className="cartao-deck-rodape">
                <span className="cartao-deck-subtexto">
                  {ehAtivo ? cartao.numeroMascara : cartao.taxaMensal || ''}
                </span>
                {cartao.taxaMensal && !ehAtivo && (
                  <span className="cartao-deck-taxa">{cartao.taxaMensal}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
