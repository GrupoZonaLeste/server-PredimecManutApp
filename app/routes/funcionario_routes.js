import { Router } from "express";
import FuncionarioController from '../controllers/funcionario_controller.js'

const router = Router()

router.get("/funcionario", FuncionarioController.getAll)
router.get("/funcionario/:id", FuncionarioController.getOne)
router.post("/funcionario", FuncionarioController.create)
router.post("/funcionario/login", FuncionarioController.login)
router.put("/funcionario/:id", FuncionarioController.update)
router.delete("/funcionario/:id", FuncionarioController.delete)

export default router