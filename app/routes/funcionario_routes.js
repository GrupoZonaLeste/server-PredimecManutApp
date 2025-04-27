import { Router } from "express";
import FuncionarioController from '../controllers/funcionario_controller.js'

const router = Router()

router.get("/funcionarios", FuncionarioController.getAll)
router.get("/funcionario/:id", FuncionarioController.getOne)
router.post("/create_funcionario", FuncionarioController.create)
router.put("/update_funcionario/:id", FuncionarioController.update)
router.delete("/delete_funcionario/:id", FuncionarioController.delete)

export default router