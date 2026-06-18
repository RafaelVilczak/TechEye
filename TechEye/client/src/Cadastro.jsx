import React, { useState } from 'react'
import logo from './assets/logo.png'

export default function Cadastro({ setPage }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const [mostrarSenha, setMostrarSenha] =
  useState(false)

  const [confirmarSenha, setConfirmarSenha] = useState('')

  async function cadastro() {
    if (!nome || !email || !senha) {
      alert('Preencha todos os campos')
      return
    }
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem')
      return
    }
    try {
      const res = await fetch('/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome,
          email,
          senha
        })
      })
      if (res.ok) {
        alert('Conta criada com sucesso!')
        setPage('login')
      } else {
        const erro = await res.text()
        console.log(erro)
        alert('Erro ao cadastrar')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao conectar ao servidor')
    }
  }

  return (
    <div className="auth-layout">

      {/* LOGO */}
      <div className="auth-left">
        <img
          src={logo}
          alt="TechEye"
          className="auth-logo"
        />
      </div>

      {/* FORMULÁRIO */}
      <div className="auth-right">

        <h1>CADASTRO</h1>

        <div className="auth-form">
          <label>Nome</label>
          <input
            type="text"
            placeholder="Digite seu nome"
            value={nome}
            onChange={(e)=>setNome(e.target.value)}
          />
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

          <label>Confirmar Senha</label>
          <div className="password-field">
            <input
              type={
                mostrarSenha
                  ? "text"
                  : "password"
              }
              placeholder="Confirme sua senha"
              value={confirmarSenha}
              onChange={(e)=>
                setConfirmarSenha(e.target.value)
              }
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
            onClick={cadastro}
            disabled={
              !senha ||
              senha !== confirmarSenha
            }
          >
            Cadastrar
          </button>
          
          <p
            className="auth-link"
            onClick={() => setPage('login')}
          >
            Já possui uma conta? Entrar
          </p>
        </div>
      </div>
    </div>
  )
}