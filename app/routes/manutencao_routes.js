import { Router } from "express";
import ManutencaoController from '../controllers/manutencao_controller.js'

const router = Router()

router.get("/manutencoes", ManutencaoController.getAll)
router.get("/manutencao/:id", ManutencaoController.getOne)
router.post("/create_manutencao", ManutencaoController.create)
router.put("/update_manutencao/:id", ManutencaoController.update)
router.delete("/delete_manutencao/:id", ManutencaoController.delete)

export default router