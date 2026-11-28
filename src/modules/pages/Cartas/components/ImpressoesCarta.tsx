import { useId, useRef, useState } from 'react';
import { ImagePlus, ImageOff, Languages, Layers3, Link2, LoaderCircle, Plus, Trash2, Upload } from 'lucide-react';
import { Botao } from '@/shared/components/Botao/Botao';
import { Select } from '@/shared/components/Select/Select';
import { CampoSelecaoCarta } from './CampoSelecaoCarta/CampoSelecaoCarta';
import { enviarImagemCatalogo, extrairMensagemErro } from '@/modules/pages/Catalogos/api/catalogosApi';
import type { ImpressaoCarta, FiltroOpcao } from '../api/cartasApi';
import './ImpressoesCarta.css';

interface PropriedadesImpressoesCarta {
  valor: ImpressaoCarta[];
  idiomas: FiltroOpcao[];
  edicoes: string[];
  aoAlterar: (itens: ImpressaoCarta[]) => void;
  aoEnviar: (enviando: boolean) => void;
}

interface PropriedadesImpressao {
  item: ImpressaoCarta;
  numero: number;
  idiomas: FiltroOpcao[];
  edicoes: string[];
  bloqueado: boolean;
  mudar: (dados: Partial<ImpressaoCarta>) => void;
  remover: () => void;
  aoEnviar: (enviando: boolean) => void;
}

function Impressao({ item, numero, idiomas, edicoes, bloqueado, mudar, remover, aoEnviar }: PropriedadesImpressao) {
  const id = useId();
  const arquivoRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [imagemComErro, setImagemComErro] = useState<string | null>(null);
  const idioma = idiomas.find((opcao) => opcao.id === item.idiomaId)?.nome;
  const temImagem = !!item.imagemUrl && imagemComErro !== item.imagemUrl;

  async function enviar(arquivo?: File) {
    if (!arquivo) return;
    setEnviando(true); aoEnviar(true); setErro('');
    try {
      mudar({ imagemUrl: await enviarImagemCatalogo(arquivo) });
      setImagemComErro(null);
    } catch (falha) { setErro(extrairMensagemErro(falha)); }
    finally { setEnviando(false); aoEnviar(false); }
  }

  return <fieldset className="impressao-carta" disabled={bloqueado} aria-labelledby={`${id}-titulo`} aria-busy={enviando}>
    <legend className="impressao-carta-legenda">Impressão {numero}</legend>
    <div className="impressao-carta-cabecalho">
      <span className="impressao-carta-numero" aria-hidden="true">{String(numero).padStart(2, '0')}</span>
      <div className="impressao-carta-identidade">
        <h5 id={`${id}-titulo`}>{item.edicao.trim() || 'Nova impressão'}</h5>
        <span><Languages size={13} aria-hidden="true" />{idioma || 'Selecione o idioma'}</span>
      </div>
      {item.id ? <span className="impressao-carta-status">Cadastrada</span> : <Botao
        variante="fantasma" classeExtra="impressao-carta-remover" icone={<Trash2 size={15} />}
        aria-label={`Remover impressão ${numero}`} title="Remover impressão" onClick={remover} type="button"
      >Remover</Botao>}
    </div>
    <div className="impressao-carta-corpo">
      <div className="impressao-carta-imagem">
        <div className="impressao-carta-previa">
          {temImagem ? <img src={item.imagemUrl!} alt={`Impressão ${numero}: ${item.edicao || 'edição'} em ${idioma || 'idioma não informado'}`}
            onError={() => setImagemComErro(item.imagemUrl ?? null)} /> : <span>
            {item.imagemUrl ? <ImageOff size={25} strokeWidth={1.5} /> : <ImagePlus size={25} strokeWidth={1.5} />}
            <span>{item.imagemUrl ? 'Imagem indisponível' : 'Sem imagem'}</span>
          </span>}
        </div>
        <span className="impressao-carta-previa-legenda">Prévia da carta</span>
      </div>
      <div className="impressao-carta-conteudo">
        <div className="impressao-carta-campos">
          <CampoSelecaoCarta
            rotulo="Edição"
            valor={item.edicao}
            opcoes={edicoes}
            obrigatorio
            desabilitado={!!item.id || bloqueado}
            novoValor={item.id ? undefined : { maxLength: 100 }}
            aoAlterar={(edicao) => mudar({ edicao })}
          />
          <div className="catalogo-campo">
            <span>Idioma <span className="impressao-carta-obrigatorio">*</span></span>
            <Select valor={item.idiomaId} rotuloAcessivel={`Idioma da impressão ${numero}`} desabilitado={!!item.id || bloqueado}
              opcoes={idiomas.map((i) => ({ valor: i.id, rotulo: i.nome }))} aoAlterar={(idiomaId) => mudar({ idiomaId })} />
          </div>
        </div>
        <div className="impressao-carta-upload">
          <div><strong>Imagem desta impressão</strong><p>Use a arte desta edição no idioma selecionado.</p></div>
          <Botao type="button" icone={enviando ? <LoaderCircle className="impressao-carta-carregando" size={16} /> : <Upload size={16} />}
            onClick={() => arquivoRef.current?.click()} disabled={bloqueado}>
            {enviando ? 'Enviando…' : item.imagemUrl ? 'Trocar imagem' : 'Importar imagem'}
          </Botao>
          <input ref={arquivoRef} className="impressao-carta-arquivo" type="file" accept="image/png,image/jpeg,image/webp"
            aria-label={`Importar imagem da impressão ${numero}`} tabIndex={-1} onChange={(e) => {
              const arquivo = e.target.files?.[0]; e.target.value = ''; void enviar(arquivo);
            }} />
          <small>PNG, JPG ou WebP · até 5 MB</small>
        </div>
        <details className="impressao-carta-link">
          <summary><Link2 size={14} aria-hidden="true" />Usar link de imagem</summary>
          <label className="catalogo-campo" htmlFor={`${id}-url`}><span>URL da imagem</span>
            <input id={`${id}-url`} type="url" maxLength={500} value={item.imagemUrl ?? ''}
              placeholder="https://…" onChange={(e) => mudar({ imagemUrl: e.target.value })} />
          </label>
        </details>
        {item.id && <p className="impressao-carta-nota">Para outra edição ou idioma, adicione uma nova impressão.</p>}
        {erro && <p className="impressao-carta-erro" role="alert">{erro}</p>}
      </div>
    </div>
  </fieldset>;
}

export function ImpressoesCarta({ valor, idiomas, edicoes, aoAlterar, aoEnviar }: PropriedadesImpressoesCarta) {
  const [enviando, setEnviando] = useState(false);
  const alterarEnvio = (ativo: boolean) => { setEnviando(ativo); aoEnviar(ativo); };
  const adicionar = () => aoAlterar([...valor, { edicao: '', idiomaId: idiomas[0]?.id ?? 0, imagemUrl: '' }]);

  return <div className="impressoes-carta">
    <p className="impressoes-carta-introducao">Cada combinação de edição e idioma tem sua própria imagem.</p>
    {valor.length ? <div className="impressoes-carta-lista">
      {valor.map((item, indice) => <Impressao key={item.id ? `salva-${item.id}` : `nova-${indice}`} item={item} numero={indice + 1}
        idiomas={idiomas} edicoes={edicoes} bloqueado={enviando} aoEnviar={alterarEnvio}
        mudar={(dados) => aoAlterar(valor.map((atual, i) => i === indice ? { ...atual, ...dados } : atual))}
        remover={() => aoAlterar(valor.filter((_, i) => i !== indice))} />)}
    </div> : <div className="impressoes-carta-vazio">
      <span className="impressoes-carta-vazio-icone"><Layers3 size={24} strokeWidth={1.5} /></span>
      <strong>Adicione a primeira impressão</strong>
      <p>Escolha a edição, selecione o idioma e associe a imagem da carta.</p>
    </div>}
    <div className="impressoes-carta-rodape">
      <Botao type="button" variante="secundario" icone={<Plus size={16} />} disabled={enviando || !idiomas.length} onClick={adicionar}>
        Adicionar impressão
      </Botao>
      <span>{!idiomas.length ? 'Cadastre um idioma para começar.' : `${valor.length} ${valor.length === 1 ? 'impressão' : 'impressões'}`}</span>
    </div>
  </div>;
}
