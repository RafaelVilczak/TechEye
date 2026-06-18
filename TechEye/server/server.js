import express from 'express'
import cors from 'cors'
import { db } from './db.js'


import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()
app.use(cors())
app.use(express.json())

app.use(
  express.static(
    path.join(__dirname, '../client/dist')
  )
)

// ================= LOGIN =================
app.post('/cadastro', async (req, res) => {
  console.log('BODY:', req.body)

  const { nome, email, senha } = req.body

  try {
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    )

    console.log('Inserido:', result)

    res.sendStatus(201)

  } catch (err) {
    console.error('ERRO REAL:', err)
    res.status(500).json({ erro: err.message })
  }
})

app.post('/login', async (req, res) => {
  const { email, senha } = req.body

  const [rows] = await db.query(
    'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
    [email, senha]
  )

  if (rows.length === 0) return res.sendStatus(401)

  res.json(rows[0])
})


// ================= DASHBOARD ================
app.get('/dashboard', async (req, res) => {
  try {

    const { inicio, fim } = req.query

    const filtroData =
      inicio && fim
        ? `WHERE data_inicio BETWEEN '${inicio}' AND '${fim}'`
        : ''

    const [[equipamentos]] = await db.query(
      'SELECT COUNT(*) as total FROM equipamentos'
    )

    const [[licencas]] = await db.query(
      'SELECT COUNT(*) as total FROM licencas'
    )

    const [[manutencoes]] = await db.query(`
      SELECT COUNT(*) as total
      FROM manutencoes
      ${filtroData}
    `)

    const [porMes] = await db.query(`
      SELECT
        MONTH(data_inicio) as mes,
        COUNT(*) as total
      FROM manutencoes
      ${
        inicio && fim
          ? `WHERE data_inicio BETWEEN '${inicio}' AND '${fim}'`
          : 'WHERE data_inicio IS NOT NULL'
      }
      GROUP BY MONTH(data_inicio)
      ORDER BY mes
    `)

    const [inativos] = await db.query(`
      SELECT
        e.nome,
        l.nome as licenca
      FROM equipamentos e
      LEFT JOIN licencas l ON e.licenca_id = l.id
      WHERE e.status = 'Inativo'
      AND e.licenca_id IS NOT NULL
    `)

    const [expirando] = await db.query(`
      SELECT
        nome,
        empresa,
        data_aquisicao,
        periodo_renovacao
      FROM licencas
      WHERE modelo_aquisicao = 'Recorrente'
    `)

    const [equipamentosStatus] = await db.query(`
      SELECT
        status,
        COUNT(*) as total
      FROM equipamentos
      GROUP BY status
    `)
    
    const [manutencoesStatus] = await db.query(`
      SELECT
        status,
        COUNT(*) as total
      FROM manutencoes
      ${filtroData}
      GROUP BY status
    `)
    
    const [licencasTipo] = await db.query(`
      SELECT
        tipo_software,
        COUNT(*) as total
      FROM licencas
      GROUP BY tipo_software
      `)

    const [licencasVencendo] = await db.query(`
      SELECT
        nome,
        empresa,
        DATE_ADD(
          data_aquisicao,
          INTERVAL periodo_renovacao MONTH
        ) AS vencimento
      FROM licencas
      WHERE
        modelo_aquisicao <> 'Permanente'
        AND periodo_renovacao IS NOT NULL
    `)

    const [equipamentosMaisManutencao] = await db.query(`
      SELECT
        e.nome,
        COUNT(m.id) AS total
      FROM equipamentos e
      LEFT JOIN manutencoes m
        ON m.equipamento_id = e.id
        ${
          inicio && fim
            ? `AND m.data_inicio BETWEEN '${inicio}' AND '${fim}'`
            : ''
        }
      GROUP BY e.id, e.nome
      ORDER BY total DESC
      LIMIT 5
    `)

    const [[equipamentosAtivos]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM equipamentos
      WHERE status = 'Ativo'
    `)

    const disponibilidade =
      equipamentos.total > 0
        ? Number(
            (
              equipamentosAtivos.total /
              equipamentos.total
            ) * 100
          ).toFixed(1)
        : 0

    const hoje = new Date()

    const alertasVencimento = licencasVencendo
      .map(l => {

        const vencimento = new Date(l.vencimento)

        const dias =
          Math.ceil(
            (vencimento - hoje) /
            (1000 * 60 * 60 * 24)
          )

        return {
          ...l,
          dias
        }

      })
      .filter(l =>
        l.dias <= 30 &&
        l.dias >= 0
      )
      .sort((a,b)=>a.dias-b.dias)

    const [manutencoesTipo] = await db.query(`
      SELECT
        tipo,
        COUNT(*) AS total
      FROM manutencoes
      ${filtroData}
      GROUP BY tipo
    `)

    const [ultimosMeses] = await db.query(`
      SELECT
        YEAR(data_inicio) ano,
        MONTH(data_inicio) mes,
        COUNT(*) total
      FROM manutencoes
      GROUP BY
        YEAR(data_inicio),
        MONTH(data_inicio)
      ORDER BY
        ano DESC,
        mes DESC
      LIMIT 2
    `)

    let tendencia = {
      atual: 0,
      anterior: 0,
      percentual: 0,
      nomeAtual: '',
      nomeAnterior: ''
    }
    const nomesMeses = [
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
    if (ultimosMeses.length > 0) {
      tendencia.atual =
        Number(ultimosMeses[0].total)
      tendencia.nomeAtual =
        nomesMeses[
          ultimosMeses[0].mes - 1
        ]
    }
    if (ultimosMeses.length > 1) {
      tendencia.anterior =
        Number(ultimosMeses[1].total)
      tendencia.nomeAnterior =
        nomesMeses[
          ultimosMeses[1].mes - 1
        ]
    }
    if (tendencia.anterior > 0) {
      tendencia.percentual =
        (
          (
            tendencia.atual -
            tendencia.anterior
          )
          /
          tendencia.anterior
        ) * 100
    }

    res.json({
      totais: {
        equipamentos: equipamentos.total,
        licencas: licencas.total,
        manutencoes: manutencoes.total
      },

      porMes,

      equipamentosStatus,
      manutencoesStatus,
      licencasTipo,

      equipamentosMaisManutencao,
      disponibilidade,

      manutencoesTipo,
      tendencia,
      
      alertasVencimento,

      inativos,
      expirando
    })

  } catch (err) {
    console.error('ERRO DASHBOARD:', err)

    res.status(500).json({
      error: err.message
    })
  }
})

// ================= LICENCAS =================
//GET
app.get('/licencas', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM licencas')
  res.json(rows)
})

//CREATE
app.post('/licencas', async (req, res) => {
  const {
    nome,
    modelo_aquisicao,
    data_aquisicao,
    periodo_renovacao,
    empresa,
    tipo_software
  } = req.body

  await db.query(
    `INSERT INTO licencas
    (nome, modelo_aquisicao, data_aquisicao, periodo_renovacao, empresa, tipo_software)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      nome,
      modelo_aquisicao,
      data_aquisicao,
      periodo_renovacao,
      empresa,
      tipo_software
    ]
  )

  res.sendStatus(201)
})

//UPDATE
app.put('/licencas/:id', async (req, res) => {
  const {
    nome,
    modelo_aquisicao,
    data_aquisicao,
    periodo_renovacao,
    empresa,
    tipo_software
  } = req.body

  console.log('UPDATE ID:', req.params.id) // DEBUG
  console.log('BODY:', req.body)

  await db.query(
    `UPDATE licencas SET
      nome = ?,
      modelo_aquisicao = ?,
      data_aquisicao = ?,
      periodo_renovacao = ?,
      empresa = ?,
      tipo_software = ?
    WHERE id = ?`,
    [
      nome,
      modelo_aquisicao,
      data_aquisicao,
      periodo_renovacao,
      empresa,
      tipo_software,
      req.params.id
    ]
  )

  res.sendStatus(200)
})

//DELETE
app.delete('/licencas/:id', async (req, res) => {
  await db.query('DELETE FROM licencas WHERE id = ?', [req.params.id])
  res.sendStatus(204)
})

// ================= EQUIPAMENTOS =================
// GET
app.get('/equipamentos', async (req, res) => {
  const [rows] = await db.query(`
    SELECT e.*, l.nome AS licenca_nome
    FROM equipamentos e
    LEFT JOIN licencas l ON e.licenca_id = l.id
  `)
  res.json(rows)
})

// CREATE
app.post('/equipamentos', async (req, res) => {
  const { 
    nome,
    usuario,
    licenca_id,
    memoria_ram,
    processador,
    armazenamento,
    data_aquisicao,
    status
  } = req.body

  await db.query(
    `INSERT INTO equipamentos 
    (nome, usuario, licenca_id, memoria_ram, processador, armazenamento, data_aquisicao, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nome,
      usuario,
      licenca_id,
      memoria_ram,
      processador,
      armazenamento,
      data_aquisicao,
      status
    ]
  )

  res.sendStatus(201)
})

app.put('/equipamentos/:id', async (req, res) => {
  const {
    nome,
    usuario,
    licenca_id,
    memoria_ram,
    processador,
    armazenamento,
    data_aquisicao,
    status
  } = req.body

  await db.query(
    `UPDATE equipamentos SET
      nome = ?,
      usuario = ?,
      licenca_id = ?,
      memoria_ram = ?,
      processador = ?,
      armazenamento = ?,
      data_aquisicao = ?,
      status = ?
    WHERE id = ?`,
    [
      nome,
      usuario,
      licenca_id,
      memoria_ram,
      processador,
      armazenamento,
      data_aquisicao,
      status,
      req.params.id
    ]
  )

  res.sendStatus(200)
})

// DELETE
app.delete('/equipamentos/:id', async (req, res) => {
  await db.query('DELETE FROM equipamentos WHERE id = ?', [req.params.id])
  res.sendStatus(204)
})

// ================= MANUTENCOES =================
//GET
app.get('/manutencoes', async (req, res) => {
  const [rows] = await db.query(`
    SELECT m.*, e.nome as equipamento_nome
    FROM manutencoes m
    LEFT JOIN equipamentos e ON m.equipamento_id = e.id
    ORDER BY m.data_inicio ASC
  `)
  res.json(rows)
})

//CREATE
app.post('/manutencoes', async (req, res) => {
  const { 
    equipamento_id,
    tecnico,
    tipo,
    data_inicio,
    data_fim,
    descricao
  } = req.body

  // pega status atual do equipamento
  const [[equipamento]] = await db.query(
    'SELECT status FROM equipamentos WHERE id = ?',
    [equipamento_id]
  )

  const statusAnterior = equipamento?.status || null

  // cria manutenção já como Entrada
  await db.query(
    `INSERT INTO manutencoes 
    (equipamento_id, tecnico, tipo, status, data_inicio, data_fim, descricao, status_anterior) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      equipamento_id,
      tecnico,
      tipo,
      'Entrada',
      data_inicio,
      data_fim,
      descricao,
      statusAnterior
    ]
  )

  // muda equipamento para Manutenção
  await db.query(
    'UPDATE equipamentos SET status = ? WHERE id = ?',
    ['Manutenção', equipamento_id]
  )

  res.sendStatus(201)
})

//UPDATE
app.put('/manutencoes/:id', async (req, res) => {
  const {
    tecnico,
    tipo,
    status,
    data_inicio,
    data_fim,
    equipamento_id,
    descricao
  } = req.body

  await db.query(
    `UPDATE manutencoes SET
      tecnico = ?,
      tipo = ?,
      status = ?,
      data_inicio = ?,
      data_fim = ?,
      equipamento_id = ?,
      descricao = ?
    WHERE id = ?`,
    [
      tecnico,
      tipo,
      status,
      data_inicio,
      data_fim,
      equipamento_id,
      descricao,
      req.params.id
    ]
  )

  //voltar status original
  if(status === 'Concluido'){
    const [[manut]] = await db.query(
      'SELECT status_anterior FROM manutencoes WHERE id = ?',
      [req.params.id]
    )

    await db.query(
      'UPDATE equipamentos SET status = ? WHERE id = ?',
      [manut.status_anterior || 'Ativo', equipamento_id]
    )
  }

  res.sendStatus(200)
})

//DELETE
app.delete('/manutencoes/:id', async (req, res) => {
  await db.query('DELETE FROM manutencoes WHERE id = ?', [req.params.id])
  res.sendStatus(204)
})


// ==========================================
app.get('*', (req,res)=>{
  res.sendFile(
    path.join(__dirname,'../client/dist/index.html')
  )
})


// ================= SERVER =================
app.listen(3001, () => {
  console.log('Servidor com MySQL rodando')
})