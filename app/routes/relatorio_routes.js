import { Router } from "express";
import RelatorioController from '../controllers/relatorio_controller.js'
import ManutencaoController from '../controllers/manutencao_controller.js'
import { autenticarSessao } from "../middlewares/auth.js";
const router = Router();
router.use(autenticarSessao);
router.post("/relatorio/:id", async (req,res) => {
    const manutController = await ManutencaoController.getRelatorio(req, res)
    const relatorio = new RelatorioController(manutController)
    res.send(relatorio.gerarRelatorio())
})

export default router