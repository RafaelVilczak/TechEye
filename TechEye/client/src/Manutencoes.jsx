import React from 'react'
import { useEffect,useState } from 'react'

export default function Manutencoes(){
  const [data,setData]=useState([])
  const [equipamentos,setEquipamentos]=useState([])

  const [modalOpen,setModalOpen]=useState(false)
  const [editId,setEditId]=useState(null)

  const [tecnico,setTecnico]=useState('')
  const [tipo,setTipo]=useState('')
  const [status,setStatus]=useState('')
  const [data_inicio,setDataInicio]=useState('')
  const [data_fim,setDataFim]=useState('')
  const [equipamentoId,setEquipamentoId]=useState('')
  const [descricao, setDescricao]=useState('')

  const statusOrdem = ['Entrada','Análise','Manutenção','Concluido']

  async function load(){
    const r1=await fetch('/manutencoes')
    setData(await r1.json())

    const r2=await fetch('/equipamentos')
    setEquipamentos(await r2.json())
  }

  useEffect(()=>{load()},[])

  function resetForm(){
    setTecnico('')
    setTipo('')
    setStatus('')
    setDataInicio('')
    setDataFim('')
    setEquipamentoId('')
    setDescricao('')
  }

  function proximoStatus(atual){
    const index = statusOrdem.indexOf(atual)
    if(index === -1 || index === statusOrdem.length - 1){
      return atual
    }
    return statusOrdem[index + 1]
  }

  function startEdit(d){
    setEditId(Number(d.id))

    setTecnico(d.tecnico)
    setTipo(d.tipo)
    setStatus(d.status)
    setDataInicio(d.data_inicio?.split('T')[0] || '')
    setDataFim(d.data_fim?.split('T')[0] || '')
    setEquipamentoId(d.equipamento_id)
    setDescricao(d.descricao)

    setModalOpen(true)
  }

  async function add(){
    const isEditing = editId !== null

    const url = isEditing
      ? `/manutencoes/${editId}`
      : '/manutencoes'

    const method = isEditing ? 'PUT' : 'POST'

    await fetch(url,{
      method,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        tecnico,
        tipo,
        status: editId ? status : 'Entrada',
        data_inicio,
        data_fim,
        equipamento_id:equipamentoId,
        descricao
      })
    })

    resetForm()
    setEditId(null)
    setModalOpen(false)
    load()
  }

  async function updateStatus(d){
    const novoStatus = proximoStatus(d.status)

    await fetch(`/manutencoes/${d.id}`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        tecnico: d.tecnico,
        tipo: d.tipo,
        status: novoStatus,
        data_inicio: d.data_inicio,
        data_fim: d.data_fim,
        equipamento_id: d.equipamento_id,
        descricao: d.descricao
      })
    })

    load()
  }

  async function del(id){
    await fetch(`/manutencoes/${id}`,{method:'DELETE'})
    load()
  }

  const agrupado = {}
  statusOrdem.forEach(s=>{
    agrupado[s] = data.filter(d=>d.status === s)
  })

  return (
    <div>
      <h2>Manutenções</h2>

      <button className="floating-btn" onClick={()=>setModalOpen(true)}>
        +
      </button>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={()=>{
          setModalOpen(false)
          setEditId(null)
          resetForm()
        }}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>

            <h2 style={{textAlign:'center'}}>
              {editId ? 'Editar Manutenção' : 'Cadastrar Manutenção'}
            </h2>

            <div>
              <label>Equipamento</label>
            <select value={equipamentoId} onChange={e=>setEquipamentoId(e.target.value)}>
              <option value="">--</option>
              {equipamentos.map(e=>(
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
            </div>

            <div>
              <label>Técnico</label>
            <input value={tecnico} onChange={e=>setTecnico(e.target.value)} />
            </div>

            <div>
              <label>Tipo de Manutenção</label>
            <select value={tipo} onChange={e=>setTipo(e.target.value)}>
              <option value="">--</option>
              <option value="Preventiva">Preventiva</option>
              <option value="Corretiva">Corretiva</option>
            </select>
            </div>

            <div>
              <label>Data de Entrada</label>
              <input
                type="date"
                value={data_inicio}
                onChange={e=>setDataInicio(e.target.value)}
              />
            </div>

            <div>
              <label>Data Final</label>
              <input
                type="date"
                value={data_fim}
                onChange={e=>setDataFim(e.target.value)}
              />
            </div>

            <div>
              <label>Descrição</label>
            <textarea
              value={descricao}
              onChange={e=>setDescricao(e.target.value)}
            />
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={add}>
                {editId ? 'Atualizar' : 'Salvar'}
              </button>

              <button className="btn-secondary" onClick={()=>{
                setModalOpen(false)
                setEditId(null)
                resetForm()
              }}>
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* KANBAN */}
      <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
        {statusOrdem.map(status=>(
          <div key={status}>

            <h3 style={{
              borderBottom:'1px solid #334155',
              paddingBottom:'5px'
            }}>
              {status}
            </h3>

            <ul>
              {agrupado[status].map(d=>(
                <li key={d.id} style={{
                  flexDirection:'column',
                  alignItems:'flex-start',
                  padding:'12px 16px',
                  gap:'8px',
                  fontSize: '16px'
                }}>

                  {/* LINHA 1: Equipamento + Status */}
                  <div style={{
                    display:'flex',
                    justifyContent:'space-between',
                    width:'100%'
                  }}>
                    <p style={{margin:0}}>
                      <strong>Equipamento:</strong> {d.equipamento_nome}
                    </p>

                    <span style={{
                      background: d.tipo === 'Corretiva' ? '#ef4444' : '#38bdf8',
                      padding:'2px 6px',
                      borderRadius:'5px',
                      fontSize:'15px',
                      color:'#022c22'
                    }}>
                      {d.tipo}
                    </span>
                  </div>

                  {/* LINHA 2: Técnico | Início | Fim */}
                  <div style={{
                    display:'grid',
                    gridTemplateColumns:'1fr 1fr 1fr',
                    width:'100%',
                    fontSize:'15px'
                  }}>
                    <p style={{margin:0}}>
                      <strong>Técnico:</strong> {d.tecnico}
                    </p>

                    <p style={{margin:0}}>
                      <strong>Data de Entrada:</strong> {
                        d.data_inicio
                          ? new Date(d.data_inicio).toLocaleDateString('pt-BR')
                          : 'N/A'
                      }
                    </p>

                    <p style={{margin:0}}>
                      <strong>Data Final:</strong> {
                        d.data_fim
                          ? new Date(d.data_fim).toLocaleDateString('pt-BR')
                          : 'N/A'
                      }
                    </p>
                  </div>

                  {/* LINHA 3: Descrição */}
                  <p style={{
                    margin:0,
                    width:'100%',
                    gap: '5px',
                    fontSize:'15px'
                  }}>
                    <strong>Descrição:</strong> {d.descricao || 'N/A'}
                  </p>

                  {/* AÇÕES */}
                  <div style={{
                    display:'flex',
                    justifyContent:'flex-end',
                    width:'100%'
                  }}>
                    <button onClick={()=>startEdit(d)}>Editar</button>
                    <button onClick={()=>updateStatus(d)}>✔</button>
                    <button onClick={()=>del(d.id)}>X</button>
                  </div>

                </li>
              ))}
            </ul>

          </div>
        ))}
      </div>

    </div>
  )
}