import React, { useState } from 'react'
import DashboardHome from './DashboardHome'
import Licencas from './Licencas'
import Equipamentos from './Equipamentos'
import Manutencoes from './Manutencoes'
import logo from './assets/logo.png'
import './style.css'

export default function Dashboard({ setUser }) {
  const [page, setPage] = useState('home')

  return (
    <div className="container">
      
      <aside className="sidebar">

        <div className="sidebar-logo">
          <img
            src={logo}
            alt="TechEye"
          />
        </div>

        <button
          className={page === 'home' ? 'active' : ''}
          onClick={()=>setPage('home')}
        >
          Painel
        </button>

        <button
          className={page === 'lic' ? 'active' : ''}
          onClick={() => setPage('lic')}
        >
          Licenças
        </button>

        <button
          className={page === 'eq' ? 'active' : ''}
          onClick={() => setPage('eq')}
        >
          Equipamentos
        </button>

        <button
          className={page === 'man' ? 'active' : ''}
          onClick={() => setPage('man')}
        >
          Manutenções
        </button>

        <button className="logout" onClick={() => setUser(null)}>
          Logout
        </button>
      </aside>

      <main className="content">
        {page === 'home' && <DashboardHome />}
        {page === 'lic' && <Licencas />}
        {page === 'eq' && <Equipamentos />}
        {page === 'man' && <Manutencoes />}
      </main>

    </div>
  )
}