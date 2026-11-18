import React, { FormEvent, useState } from 'react';
import { isAxiosError } from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminCookieSessionError, useLoginAdmin } from '@/app/auth/adminAuthApi';
import './AdminLoginPage.css';

export const AdminLoginPage: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const login = useLoginAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/admin';

  const aoEntrar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    login.mutate(
      { cpf, senha },
      { onSuccess: () => navigate(destino, { replace: true }) },
    );
  };

  const status = isAxiosError(login.error) ? login.error.response?.status : undefined;
  const mensagemErro = login.error instanceof AdminCookieSessionError
    ? 'A sessão não foi confirmada. Verifique se o navegador aceita cookies e se a API está acessível pelo proxy /api.'
    : status === 429
      ? 'Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.'
      : status === 401
        ? 'CPF ou senha inválidos, ou conta sem acesso administrativo.'
        : 'Não foi possível comunicar com o serviço de autenticação. Tente novamente.';

  return (
    <main className="pagina-login-admin">
      <section className="cartao-login-admin" aria-labelledby="titulo-login-admin">
        <div className="marca-login-admin">JoeStock</div>
        <p className="sobretitulo-login-admin">Painel administrativo</p>
        <h1 id="titulo-login-admin">Acesse sua conta</h1>
        <p className="descricao-login-admin">Entre com suas credenciais de administrador.</p>

        <form className="formulario-login-admin" onSubmit={aoEntrar}>
          <label htmlFor="cpf-admin">CPF</label>
          <input
            id="cpf-admin"
            name="cpf"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            maxLength={14}
            value={cpf}
            onChange={(evento) => setCpf(evento.target.value)}
            required
          />

          <label htmlFor="senha-admin">Senha</label>
          <input
            id="senha-admin"
            name="senha"
            type="password"
            autoComplete="current-password"
            maxLength={256}
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />

          {login.isError && (
            <p className="erro-login-admin" role="alert">
              {mensagemErro}
            </p>
          )}

          <button type="submit" disabled={login.isPending}>
            {login.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
};
