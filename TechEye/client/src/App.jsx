import React, { useState } from 'react'
import Login from './Login'
import Register from './Cadastro'
import Dashboard from './Dashboard'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')

  if (user) return <Dashboard setUser={setUser} />

  return page === 'login'
    ? <Login setUser={setUser} setPage={setPage} />
    : <Register setPage={setPage} />
}