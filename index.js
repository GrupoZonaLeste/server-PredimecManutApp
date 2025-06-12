import express from "express"
import routes_cliente from './app/routes/cliente_routes.js'
import routes_funcionario from './app/routes/funcionario_routes.js'
import routes_manutencao from './app/routes/manutencao_routes.js'
import routes_equipamento from "./app/routes/equipamento_routes.js"
import routes_relatorio from "./app/routes/relatorio_routes.js"
import routes_login from './app/routes/login_routes.js'

const app = express()

app.use(express.json())

app.use(routes_login)
app.use(routes_relatorio)
app.use(routes_cliente)
app.use(routes_funcionario)
app.use(routes_manutencao)
app.use(routes_equipamento)

const jsonErrorHandler = (err, req, res, next) => {
  console.error('Erro não tratado:', err); // Log para debug
  res.setHeader('Content-Type', 'application/json')
  res.status(500).json({
    message: err.message || 'Erro interno do servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

app.use(jsonErrorHandler)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(3000, () => {
    console.log("[SERVIDOR ATIVO] PORT=3000")
})

