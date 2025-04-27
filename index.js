import express from "express"
import routes_cliente from './app/routes/cliente_routes.js'
import routes_funcionario from './app/routes/funcionario_routes.js'
import routes_manutencao from './app/routes/manutencao_routes.js'

const app = express()

app.use(routes_cliente)
app.use(routes_funcionario)
app.use(routes_manutencao)

app.listen(3000, () => {
    console.log("[SERVIDOR ATIVO] PORT=3000")
})
