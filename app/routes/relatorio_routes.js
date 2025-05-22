import { Router } from "express";
import RelatorioController from '../controllers/relatorio_controller.js'
import { autenticarSessao } from "../middlewares/auth.js";
const router = Router();
router.use(autenticarSessao);
router.post("/relatorio", (req,res) => {
    const relatorio = new RelatorioController(req.body)
    res.send(relatorio.gerarRelatorio())
})

export default router