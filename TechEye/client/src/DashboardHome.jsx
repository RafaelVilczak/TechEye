import React, { useEffect, useState } from 'react'

export default function DashboardHome(){

  const [data,setData] = useState(null)

  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [todosPeriodos, setTodosPeriodos] = useState(true)
  const [graficoAtual, setGraficoAtual] = useState(0)

  async function load(){

    let url = '/dashboard'

    if(
      !todosPeriodos &&
      dataInicio &&
      dataFim
    ){
      url += `?inicio=${dataInicio}&fim=${dataFim}`
    }

    const res = await fetch(url)
    const json = await res.json()

    setData(json)
  }

  useEffect(()=>{
    load()
  }, [todosPeriodos])

  if(!data) return <p>Carregando...</p>

  const equipamentosStatus = data.equipamentosStatus || []
  const manutencoesStatus = data.manutencoesStatus || []
  const licencasTipo = data.licencasTipo || []
  const alertasVencimento = data.alertasVencimento || []
  const equipamentosMaisManutencao = data.equipamentosMaisManutencao || []
  const disponibilidade = data.disponibilidade || 0

  const maiorManutencao =
  equipamentosMaisManutencao.length
    ? Math.max(
        ...equipamentosMaisManutencao.map(e => Number(e.total))
      )
    : 1

  const manutencoesTipo = data.manutencoesTipo || []
  const tendencia =
  data.tendencia || {
    atual:0,
    anterior:0,
    percentual:0
  }

  const preventivas =
    Number(
      manutencoesTipo.find(t => t.tipo === 'Preventiva')?.total || 0
    )

  const corretivas =
    Number(
      manutencoesTipo.find(t => t.tipo === 'Corretiva')?.total || 0
    )

  const totalTipos = preventivas + corretivas

  const percPreventiva =
    totalTipos > 0
      ? (
          (preventivas / totalTipos) * 100
        ).toFixed(1)
      : 0

  const percCorretiva =
    totalTipos > 0
      ? (
          (corretivas / totalTipos) * 100
        ).toFixed(1)
      : 0


  /* ===== ORDENAÇÃO FIXA ===== */

  const equipamentosOrdem = [
    'Ativo',
    'Inativo',
    'Manutenção'
  ]

  const equipamentosFormatados =
    equipamentosOrdem.map(status => ({
      status,
      total:
        equipamentosStatus.find(
          s => s.status === status
        )?.total || 0
    }))

  ///////////////////////////////////////
  const manutencaoOrdem = [
    'Entrada',
    'Análise',
    'Manutenção',
    'Concluido'
  ]

  const manutencoesFormatadas =
    manutencaoOrdem.map(status => ({
      status,
      total:
        manutencoesStatus.find(
          s => s.status === status
        )?.total || 0
    }))

  ///////////////////////////////////////
  const tiposLicenca = [
    'Aplicativo',
    'Programação',
    'Sistema Operacional',
    'Utilitário'
  ]

  const licencasFormatadas =
    tiposLicenca.map(tipo => ({
      tipo_software: tipo,
      total:
        licencasTipo.find(
          l => l.tipo_software === tipo
        )?.total || 0
    }))

  /* ===== GRÁFICO MENSAL ===== */

  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ]

  const dadosMeses = meses.map((nome, index) => {

    const encontrado =
      data.porMes?.find(
        m => m.mes === index + 1
      )

    return {
      nome,
      total:
        encontrado
          ? encontrado.total
          : 0
    }
  })

  const graficos = [
    {
      titulo: 'Manutenções por mês',
      tipo: 'mensal'
    },
    {
      titulo: 'Equipamentos e Disponibilidade',
      tipo: 'equipamentos'
    },
    {
      titulo: 'Saúde das Manutenções',
      tipo: 'saude'
    }
  ]

  function proximoGrafico() {
    setGraficoAtual(
      (graficoAtual + 1) % graficos.length
    )
  }

  function graficoAnterior() {
    setGraficoAtual(
      graficoAtual === 0
        ? graficos.length - 1
        : graficoAtual - 1
    )
  }

  return (
    <div>

      {/* ===== FILTROS ===== */}
      <div className="dash-filtros">

        <label>
          <input
            type="checkbox"
            checked={todosPeriodos}
            onChange={(e)=>
              setTodosPeriodos(
                e.target.checked
              )
            }
          />
          Todos os períodos
        </label>

        {!todosPeriodos && (
          <>
            <input
              type="date"
              value={dataInicio}
              onChange={(e)=>
                setDataInicio(
                  e.target.value
                )
              }
            />

            <input
              type="date"
              value={dataFim}
              onChange={(e)=>
                setDataFim(
                  e.target.value
                )
              }
            />

            <button onClick={load}>
              Filtrar
            </button>
          </>
        )}

      </div>

      {/* ===== STATUS ===== */}
      <div className="dash-status-grid">

        {/* Equipamentos */}
        <div className="dash-box">

          <h3>Equipamentos</h3>

          {equipamentosFormatados.map((s, i)=>(
            <div
              key={i}
              className={`status-card status-${s.status.toLowerCase()}`}
            >
              <span>{s.status}</span>
              <strong>{s.total}</strong>
            </div>
          ))}

          <div className="status-card status-hidden">
            <span>-</span>
            <strong>0</strong>
          </div>

        </div>

        {/* Manutenções */}
        <div className="dash-box">

          <h3>Manutenções</h3>

          {manutencoesFormatadas.map((s,i)=>(
            <div
              key={i}
              className="status-card"
            >
              <span>{s.status}</span>
              <strong>{s.total}</strong>
            </div>
          ))}

        </div>

        {/* Licenças */}
        <div className="dash-box">

          <h3>Licenças</h3>

          {licencasFormatadas.map((s,i)=>(
            <div
              key={i}
              className="status-card"
            >
              <span>{s.tipo_software}</span>
              <strong>{s.total}</strong>
            </div>
          ))}

        </div>

      </div>

      {/* ===== CONTEÚDO ===== */}
      <div className="dash-grid">

        {/* GRÁFICO */}
        <div className="dash-box grafico-box">

          <div className="grafico-header">
            <button
              className="grafico-nav"
              onClick={graficoAnterior}
            >◀</button>
            <h3>
              {graficos[graficoAtual].titulo}
            </h3>
            <button
              className="grafico-nav"
              onClick={proximoGrafico}
            >▶</button>
          </div>

          {/* INDICADORES */}
          <div className="grafico-indicadores">
            {graficos.map((_, index)=>(
              <span
                key={index}
                className={
                  index === graficoAtual
                    ? 'indicador ativo'
                    : 'indicador'
                }
              />
            ))}
          </div>

          {/* CONTEÚDO */}
          {graficos[graficoAtual].tipo === 'mensal' && (

            <div className="grafico-wrapper">
              <div className="grafico-linhas">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>

              <div className="grafico">
                {dadosMeses.map((m,i)=>(
                  <div
                    key={i}
                    className="grafico-item"
                  >
                    <span className="grafico-valor">
                      {m.total}
                    </span>
                      <div
                        className="grafico-barra"
                        style={{
                          height: `${Math.max(m.total * 18, 8)}px`
                        }}
                      />
                    <span className="grafico-label">
                      {m.nome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}


          {graficoAtual === 1 && (
            <div className="painel-equipamentos">
              {/* Ranking */}
              <div className="painel-ranking">
                <h4>
                  Equipamentos com mais manutenções
                </h4>
                {equipamentosMaisManutencao.map((e,i)=>(
                  <div
                    key={i}
                    className="ranking-item"
                  >
                    <span>{e.nome}</span>
                    <div className="ranking-bar">
                      <div
                        className="ranking-fill"
                        style={{
                          width: `${
                            (e.total / maiorManutencao) * 100
                          }%`
                        }}
                      />
                    </div>
                    <strong>{e.total}</strong>
                  </div>
                ))}
              </div>

              {/* Disponibilidade */}
              <div className="painel-disponibilidade">
                <h4>
                  Disponibilidade
                </h4>
                <div
                  className="disponibilidade-circulo"
                  style={{
                    '--valor': disponibilidade
                  }}
                >
                  <div className="disponibilidade-interno">
                    {disponibilidade}%
                  </div>
                </div>
                <span>
                  Equipamentos ativos
                </span>
              </div>
            </div>
          )}

          {graficos[graficoAtual].tipo === 'saude' && (
            <div className="saude-grid">

              {/* Tendência */}
              <div className="saude-card">
                <h4>Tendência de Manutenções</h4>
                <div className="trend-card">
                  <div className="trend-top">
                    <span
                      className={
                        tendencia.percentual >= 0
                          ? 'trend-icon up'
                          : 'trend-icon down'
                      }
                    >
                      {tendencia.percentual >= 0
                        ? '▲'
                        : '▼'}
                    </span>
                    <span className="trend-number">
                      {Math.abs(
                        tendencia.percentual
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="trend-periodo">
                    <div className="trend-bloco">
                      <span className="trend-label">
                        {tendencia.nomeAtual}
                      </span>
                      <strong>
                        {tendencia.atual}
                      </strong>
                      <small>
                        Manutenções
                      </small>
                    </div>

                    <div className="trend-bloco">
                      <span className="trend-label">
                        {tendencia.nomeAnterior}
                      </span>
                      <strong>
                        {tendencia.anterior}
                      </strong>
                      <small>
                        Manutenções
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pizza */}
              <div className="saude-card">
                <h4>
                  Preventivas x Corretivas
                </h4>
                <div className="pizza-container">
                  <div
                    className="pizza-chart"
                    style={{
                      background: `conic-gradient(
                        #38bdf8 0 ${
                          totalTipos
                            ? (preventivas / totalTipos) * 100
                            : 0
                        }%,
                        #ef4444 ${
                          totalTipos
                            ? (preventivas / totalTipos) * 100
                            : 0
                        }% 100%
                      )`
                    }}
                  >
                    <span>{totalTipos}</span>
                  </div>

                  <div className="pizza-legenda">
                    <div className="pizza-item">
                      <span className="cor azul"></span>
                      <span>Preventivas</span>
                      <strong>
                        {preventivas} ({percPreventiva}%)
                      </strong>
                    </div>
                    <div className="pizza-item">
                      <span className="cor vermelha"></span>
                      <span>Corretivas</span>
                      <strong>
                        {corretivas} ({percCorretiva}%)
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AVISOS */}
        <div className="dash-box">

          <h3>Avisos</h3>

          <div className="dash-alert">

            <h4>Equipamentos inativos</h4>

            {data.inativos?.length === 0 &&
              <p>Nenhum</p>
            }

            {data.inativos?.map((e,i)=>(
              <p key={i}>
                ⚠ {e.nome} - {e.licenca}
              </p>
            ))}

          </div>

          <div className="dash-alert">

            <h4>
              Licenças próximas do vencimento
            </h4>

            {alertasVencimento.length === 0 &&
              <p>
                Nenhuma licença próxima do vencimento
              </p>
            }

            {alertasVencimento.map((l,i)=>(
              <p key={i}>
                ⚠ {l.nome} - {l.dias} dias
              </p>
            ))}

          </div>

        </div>

      </div>

    </div>
  )
}