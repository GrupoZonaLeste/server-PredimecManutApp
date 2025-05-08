import { Router } from "express";
import RelatorioController from '../controllers/relatorio_controller.js'

const router = Router()

router.post("/relatorio", (req,res) => {
    const relatorio = new RelatorioController(req.body)
    res.send(relatorio.gerarRelatorio())
})

export default router