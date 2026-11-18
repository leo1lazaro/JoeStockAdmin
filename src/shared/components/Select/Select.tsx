import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import './Select.css';

export interface OpcaoSelect<T extends string | number> {
  valor: T;
  rotulo: string;
}

export interface PropriedadesSelect<T extends string | number> {
  valor: T;
  opcoes: OpcaoSelect<T>[];
  aoAlterar: (valor: T) => void;
  placeholder?: string;
  desabilitado?: boolean;
  rotuloAcessivel?: string;
}

interface PosicaoMenu {
  top: number;
  left: number;
  width: number;
  paraCima: boolean;
}

const ALTURA_MAXIMA_MENU = 240;

export function Select<T extends string | number>({
  valor,
  opcoes,
  aoAlterar,
  placeholder = 'Selecione',
  desabilitado = false,
  rotuloAcessivel,
}: PropriedadesSelect<T>) {
  const idLista = useId();
  const gatilhoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [posicao, setPosicao] = useState<PosicaoMenu | null>(null);

  const indiceSelecionado = opcoes.findIndex((opcao) => opcao.valor === valor);
  const selecionada = indiceSelecionado >= 0 ? opcoes[indiceSelecionado] : null;

  const calcularPosicao = useCallback(() => {
    const gatilho = gatilhoRef.current;
    if (!gatilho) return;

    const retangulo = gatilho.getBoundingClientRect();
    const altura = Math.min(ALTURA_MAXIMA_MENU, opcoes.length * 40 + 12);
    const espacoAbaixo = window.innerHeight - retangulo.bottom;
    const paraCima = espacoAbaixo < altura + 12 && retangulo.top > espacoAbaixo;

    setPosicao({
      top: paraCima ? retangulo.top - 6 : retangulo.bottom + 6,
      left: retangulo.left,
      width: retangulo.width,
      paraCima,
    });
  }, [opcoes.length]);

  const abrir = () => {
    if (desabilitado) return;
    setIndiceAtivo(indiceSelecionado >= 0 ? indiceSelecionado : 0);
    setAberto(true);
  };

  const fechar = useCallback((devolverFoco = true) => {
    setAberto(false);
    if (devolverFoco) gatilhoRef.current?.focus();
  }, []);

  const escolher = (opcao: OpcaoSelect<T>) => {
    aoAlterar(opcao.valor);
    fechar();
  };

  useLayoutEffect(() => {
    if (aberto) calcularPosicao();
  }, [aberto, calcularPosicao]);

  useEffect(() => {
    if (!aberto) return;

    const aoClicarFora = (evento: MouseEvent) => {
      const alvo = evento.target as Node;
      if (gatilhoRef.current?.contains(alvo) || menuRef.current?.contains(alvo)) return;
      fechar(false);
    };
    const aoRolar = (evento: Event) => {
      if (menuRef.current?.contains(evento.target as Node)) return;
      fechar(false);
    };

    document.addEventListener('mousedown', aoClicarFora);
    window.addEventListener('scroll', aoRolar, true);
    window.addEventListener('resize', calcularPosicao);

    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      window.removeEventListener('scroll', aoRolar, true);
      window.removeEventListener('resize', calcularPosicao);
    };
  }, [aberto, calcularPosicao, fechar]);

  useEffect(() => {
    if (!aberto) return;
    menuRef.current?.children[indiceAtivo]?.scrollIntoView({ block: 'nearest' });
  }, [aberto, indiceAtivo]);

  const aoTeclar = (evento: React.KeyboardEvent<HTMLButtonElement>) => {
    if (desabilitado || opcoes.length === 0) return;

    if (!aberto) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(evento.key)) {
        evento.preventDefault();
        abrir();
      }
      return;
    }

    switch (evento.key) {
      case 'ArrowDown':
        evento.preventDefault();
        setIndiceAtivo((atual) => Math.min(atual + 1, opcoes.length - 1));
        break;
      case 'ArrowUp':
        evento.preventDefault();
        setIndiceAtivo((atual) => Math.max(atual - 1, 0));
        break;
      case 'Home':
        evento.preventDefault();
        setIndiceAtivo(0);
        break;
      case 'End':
        evento.preventDefault();
        setIndiceAtivo(opcoes.length - 1);
        break;
      case 'Enter':
      case ' ':
        evento.preventDefault();
        escolher(opcoes[indiceAtivo]);
        break;
      case 'Escape':
        // Evita que o Esc também feche o drawer/modal que contém o select
        evento.preventDefault();
        evento.nativeEvent.stopImmediatePropagation();
        fechar();
        break;
      case 'Tab':
        fechar(false);
        break;
    }
  };

  return (
    <>
      <button
        ref={gatilhoRef}
        type="button"
        className={`select-gatilho ${aberto ? 'aberto' : ''}`}
        onClick={() => (aberto ? fechar() : abrir())}
        onKeyDown={aoTeclar}
        disabled={desabilitado}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={idLista}
        aria-label={rotuloAcessivel}
      >
        <span className={selecionada ? 'select-valor' : 'select-placeholder'}>
          {selecionada ? selecionada.rotulo : placeholder}
        </span>
        <ChevronDown size={16} className="select-seta" />
      </button>

      {aberto &&
        posicao &&
        createPortal(
          <ul
            ref={menuRef}
            id={idLista}
            role="listbox"
            className="select-menu"
            style={{
              left: posicao.left,
              width: posicao.width,
              maxHeight: ALTURA_MAXIMA_MENU,
              ...(posicao.paraCima
                ? { bottom: window.innerHeight - posicao.top }
                : { top: posicao.top }),
            }}
          >
            {opcoes.map((opcao, indice) => (
              <li
                key={opcao.valor}
                role="option"
                aria-selected={opcao.valor === valor}
                className={`select-opcao ${indice === indiceAtivo ? 'ativa' : ''} ${
                  opcao.valor === valor ? 'selecionada' : ''
                }`}
                onMouseEnter={() => setIndiceAtivo(indice)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => escolher(opcao)}
              >
                <span>{opcao.rotulo}</span>
                {opcao.valor === valor && <Check size={15} />}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}
