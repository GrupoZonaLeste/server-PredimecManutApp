import { Router } from "express";
import ManutencaoController from '../controllers/manutencao_controller.js'
import { autenticarSessao } from "../middlewares/auth.js";

const router = Router()

router.use(autenticarSessao);

router.get("/manutencao", ManutencaoController.getAll)
router.get("/manutencao/recentes", ManutencaoController.getRecent)
router.get("/manutencao/:id", ManutencaoController.getOne)
router.get("/manutencao/:id/dados-relatorio", ManutencaoController.getRelatorio)
router.post("/manutencao", ManutencaoController.create)
//router.put("/update_manutencao/:id", ManutencaoController.update)
router.delete("/manutencao/:id", ManutencaoController.delete)

export default router