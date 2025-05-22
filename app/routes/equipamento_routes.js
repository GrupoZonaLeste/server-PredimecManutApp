import { Router } from "express";
import EquipamentoController from '../controllers/equipamento_controller.js'
import { autenticarSessao } from "../middlewares/auth.js";

const router = Router();
router.use(autenticarSessao);

router.get("/equipamento", EquipamentoController.getAll)
router.get("/equipamento/:id", EquipamentoController.getOne)
router.post("/equipamento", EquipamentoController.create)
router.put("/equipamento/:id", EquipamentoController.update)
router.delete("/equipamento/:id", EquipamentoController.delete)

export default router