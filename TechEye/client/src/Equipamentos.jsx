import React from 'react'
import { useEffect,useState } from 'react'

export default function Equipamentos(){
  const [data,setData]=useState([])
  const [licencas,setLicencas]=useState([])

  const [modalOpen,setModalOpen]=useState(false)
  const [editId,setEditId]=useState(null)

  const [nome,setNome]=useState('')
  const [usuario,setUsuario]=useState('')
  const [licencaId,setLicencaId]=useState('')
  const [memoria_ram,setMemoriaRam]=useState('')
  const [processador,setProcessador]=useState('')
  const [armazenamento,setArmazenamento]=useState('')
  const [data_aquisicao,setDataAquisicao]=useState('')
  const [status,setStatus]=useState('')

  async function load(){
    const r1=await fetch('/equipamentos')
    setData(await r1.json())

    const r2=await fetch('/licencas')
    setLicencas(await r2.json())
  }

  useEffect(()=>{load()},[])

  function resetForm(){
    setNome('')
    setUsuario('')
    setLicencaId('')
    setMemoriaRam('')
    setProcessador('')
    setArmazenamento('')
    setDataAquisicao('')
    setStatus('')
  }

  //INICIAR EDIÇÃO
  function startEdit(d){
    setEditId(Number(d.id))

    setNome(d.nome)
    setUsuario(d.usuario)
    setLicencaId(d.licenca_id)
    setMemoriaRam(d.memoria_ram)
    setProcessador(d.processador)
    setArmazenamento(d.armazenamento)
    setDataAquisicao(d.data_aquisicao?.split('T')[0] || '')
    setStatus(d.status)

    setModalOpen(true)
  }

  //UPDATE
  async function add(){
    const isEditing = editId !== null

    const url = isEditing
      ? `/equipamentos/${editId}`
      : '/equipamentos'

    const method = isEditing ? 'PUT' : 'POST'

    await fetch(url,{
      method,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        nome,
        usuario,
        licenca_id: licencaId,
        memoria_ram,
        processador,
        armazenamento,
        data_aquisicao,
        status
      })
    })

    resetForm()
    setEditId(null)
    setModalOpen(false)
    load()
  }

  async function del(id){
    await fetch(`/equipamentos/${id}`,{method:'DELETE'})
    load()
  }

  return (
    <div>
      <h2>Equipamentos</h2>

      <button className="floating-btn" onClick={()=>setModalOpen(true)}>
        +
      </button>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={()=>{
            setModalOpen(false)
            setEditId(null)
            resetForm()
          }}
        >
          <div className="modal" onClick={(e)=>e.stopPropagation()}>

            <h2 style={{textAlign:'center', margin:0}}>
              {editId ? 'Editar Equipamento' : 'Cadastrar Equipamento'}
            </h2>

            <div>
              <label>Nome do Equipamento</label>
            <input value={nome} onChange={e=>setNome(e.target.value)} />
            </div>

            <div>
              <label>Usuário</label>
            <input value={usuario} onChange={e=>setUsuario(e.target.value)} />
            </div>

            <div>
              <label>Licença</label>
            <select value={licencaId} onChange={e=>setLicencaId(e.target.value)}>
              <option value="">--</option>
              {licencas.map(l=>(
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>
            </div>

            <div>
              <label>Memória RAM</label>
            <select value={memoria_ram} onChange={e=>setMemoriaRam(e.target.value)}>
              <option value="">--</option>
              <option value="2GB">2GB</option>
              <option value="4GB">4GB</option>
              <option value="8GB">8GB</option>
              <option value="16GB">16GB</option>
              <option value="32GB">32GB</option>
              <option value="64GB">64GB</option>
              <option value="128GB">128GB</option>
            </select>
            </div>

            <div>
              <label>Processador</label>
            <input value={processador} onChange={e=>setProcessador(e.target.value)} />
            </div>

            <div>
              <label>Armazenamento</label>
            <input value={armazenamento} onChange={e=>setArmazenamento(e.target.value)} />
            </div>

            <div>
              <label>Data de Aquisição</label>
            <input type="date" value={data_aquisicao} onChange={e=>setDataAquisicao(e.target.value)} />
            </div>

            <div>
              <label>Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="">--</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Manutenção">Manutenção</option>
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
              <span className={`status-badge ${d.status}`}
              style={{fontSize:'13px',}}>
                {d.status}
              </span>
            </div>

            <div className="card-body">

              <p><strong>Usuário:</strong> {d.usuario}</p>

              <p><strong>Licença:</strong> {d.licenca_nome || 'N/A'}</p>

              <p><strong>RAM:</strong> {d.memoria_ram}</p>

              <p><strong>CPU:</strong> {d.processador}</p>

              <p><strong>Armazenamento:</strong> {d.armazenamento}</p>

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