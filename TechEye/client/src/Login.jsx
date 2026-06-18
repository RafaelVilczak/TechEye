import React, { useState } from 'react'
import logo from './assets/logo.png'

export default function Login({ setUser, setPage }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const [mostrarSenha, setMostrarSenha] =
  useState(false)

  async function login() {
    const res = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        senha
      })
    })

    if (res.ok) {
      const user = await res.json()
      setUser(user)
    } else {
      alert('Login inválido')
    }
  }

  return (
    <div className="auth-layout">

      {/* LADO ESQUERDO */}
      <div className="auth-left">
        <img
          src={logo}
          alt="TechEye"
          className="auth-logo"
        />
      </div>

      {/* LADO DIREITO */}
      <div className="auth-right">

        <h1>LOGIN</h1>

        <div className="auth-form">

          <label>Email</label>

          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <label>Senha</label>

          <div className="password-field">

            <input
              type={
                mostrarSenha
                  ? "text"
                  : "password"
              }
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e)=>setSenha(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={()=>
                setMostrarSenha(!mostrarSenha)
              }
            >
              {mostrarSenha
                ? 'Ocultar'
                : 'Mostrar'}
            </button>
          </div>

          <button
            className="auth-btn"
            onClick={login}
          >
            Entrar
          </button>

          <p
            className="auth-link"
            onClick={()=>setPage('cadastro')}
          >
            Não tem conta? Cadastre-se
          </p>

        </div>

      </div>

    </div>
  )
}