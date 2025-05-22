import { Router } from "express";
import EquipamentoController from '../controllers/equipamento_controller.js'

const router = Router()

router.get("/equipamento", EquipamentoController.getAll)
router.get("/equipamento/:id", EquipamentoController.getOne)
router.post("/equipamento", EquipamentoController.create)
router.put("/equipamento/:id", EquipamentoController.update)
router.delete("/equipamento/:id", EquipamentoController.delete)

export default router