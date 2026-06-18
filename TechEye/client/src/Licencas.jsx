import React from 'react'
import { useEffect, useState } from 'react'

export default function Licencas(){
  const [data,setData]=useState([])

  const [modalOpen,setModalOpen]=useState(false)
  const [editId,setEditId]=useState(null)

  const [nome,setNome]=useState('')
  const [modelo_aquisicao,setModeloAquisicao]=useState('')
  const [data_aquisicao,setDataAquisicao]=useState('')
  const [periodo_renovacao,setPeriodoRenovacao]=useState('')
  const [empresa,setEmpresa]=useState('')
  const [tipo_software,setTipoSoftware]=useState('')

  async function load(){
    const res=await fetch('/licencas')
    setData(await res.json())
  }

  useEffect(()=>{load()},[])

  function resetForm(){
    setNome('')
    setModeloAquisicao('')
    setDataAquisicao('')
    setPeriodoRenovacao('')
    setEmpresa('')
    setTipoSoftware('')
  }

  //EDIÇÃO
  function startEdit(d){
    setEditId(Number(d.id))

    setNome(d.nome)
    setModeloAquisicao(d.modelo_aquisicao)
    setDataAquisicao(d.data_aquisicao?.split('T')[0] || '')
    setPeriodoRenovacao(d.periodo_renovacao || '')
    setEmpresa(d.empresa)
    setTipoSoftware(d.tipo_software)

    setModalOpen(true)
  }

  //UPDATE
  async function add(){
    const periodoFinal =
      modelo_aquisicao === 'Permanente'
        ? null
        : (periodo_renovacao === '' ? null : Number(periodo_renovacao))

    const isEditing = editId !== null

    const method = isEditing ? 'PUT' : 'POST'

    const url = isEditing
      ? `/licencas/${editId}`
      : '/licencas'

    await fetch(url,{
      method,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        nome,
        modelo_aquisicao,
        data_aquisicao,
        periodo_renovacao: periodoFinal,
        empresa,
        tipo_software
      })
    })

    resetForm()
    setEditId(null)
    setModalOpen(false)
    load()
  }

  async function del(id){
    await fetch(`/licencas/${id}`,{method:'DELETE'})
    load()
  }

  return (
    <div>
      <h2>Licenças</h2>

      {/* BOTÃO FLUTUANTE */}
      <button className="floating-btn" onClick={()=>setModalOpen(true)}>
        +
      </button>

      {/* MODAL */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={()=>{
            setModalOpen(false)
            setEditId(null)
            resetForm()
          }}
        >
          <div
            className="modal"
            onClick={(e)=>e.stopPropagation()}
          >
            <h2 style={{textAlign:'center', margin:0}}>
              {editId ? 'Editar Licença' : 'Cadastrar Licença'}
            </h2>

            <div>
              <label>Licença</label>
            <input
              value={nome}
              onChange={e=>setNome(e.target.value)}
            />
            </div>

            <div>
              <label>Modelo de Aquisição</label>
            <select
              value={modelo_aquisicao}
              onChange={e=>setModeloAquisicao(e.target.value)}
            >
              <option value="">--</option>
              <option value="Permanente">Permanente</option>
              <option value="Recorrente">Recorrente</option>
            </select>
            </div>

            <div>
              <label>Data de Aquisição</label>
            <input
              type="date"
              value={data_aquisicao}
              onChange={e=>setDataAquisicao(e.target.value)}
            />
            </div>

            <div>
              <label>Período de Renovação (meses)</label>
            <input
              type="number"
              value={modelo_aquisicao === 'Permanente' ? '' : periodo_renovacao}
              onChange={e=>setPeriodoRenovacao(e.target.value)}
              disabled={modelo_aquisicao === 'Permanente'}
              min="1"
            />
            </div>

            <div>
              <label>Empresa</label>
            <input
              value={empresa}
              onChange={e=>setEmpresa(e.target.value)}
            />
            </div>

            <div>
              <label>Tipo de Software</label>
            <select
              value={tipo_software}
              onChange={e=>setTipoSoftware(e.target.value)}
            >
              <option value="">--</option>
              <option value="Sistema Operacional">Sistema Operacional</option>
              <option value="Aplicativo">Aplicativo</option>
              <option value="Programação">Programação</option>
              <option value="Utilitario">Utilitário</option>
            </select>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={add}>
                {editId ? 'Atualizar' : 'Salvar'}
              </button>

              <button
                className="btn-secondary"
                onClick={()=>{
                  setModalOpen(false)
                  setEditId(null)
                  resetForm()
                }}
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LISTA */}
      <div className="cards-container">
        {data.map(d=>(
          <div key={d.id} className="card">

            <div className="card-header">
              <h3>{d.nome}</h3>
            </div>

            <div className="card-body">

              <p><strong>Empresa:</strong> {d.empresa}</p>

              <p><strong>Modelo:</strong> {d.modelo_aquisicao}</p>

              <p>
                <strong>Renovação:</strong> {
                  d.periodo_renovacao === null
                    ? 'N/A'
                    : `${d.periodo_renovacao} meses`
                }
              </p>

              <p><strong>Tipo:</strong> {d.tipo_software}</p>

              <p>
                <strong>Aquisição:</strong> {
                  d.data_aquisicao
                    ? new Date(d.data_aquisicao).toLocaleDateString('pt-BR')
                    : 'N/A'
                }
              </p>

            </div>

            <div className="card-actions">
              <button className='button-action' onClick={()=>startEdit(d)}>Editar</button>
              <button className='button-action' onClick={()=>del(d.id)}>X</button>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}