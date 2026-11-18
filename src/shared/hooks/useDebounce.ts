import { useState, useEffect } from 'react';

/**
 * Hook para atrasar a propagação de mudanças de valor (útil em buscas e inputs rápidos)
 */
export function useDebounce<T>(valor: T, atrasoEmMs = 300): T {
  const [valorDebounced, setValorDebounced] = useState<T>(valor);

  useEffect(() => {
    const handler = setTimeout(() => {
      setValorDebounced(valor);
    }, atrasoEmMs);

    return () => {
      clearTimeout(handler);
    };
  }, [valor, atrasoEmMs]);

  return valorDebounced;
}
