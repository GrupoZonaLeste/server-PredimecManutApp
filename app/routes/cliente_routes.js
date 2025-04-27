import { Router } from "express";
import ClienteController from '../controllers/cliente_controller.js'

const router = Router()

router.get("/clientes", ClienteController.getAll)
router.get("/cliente/:id", ClienteController.getOne)
router.post("/create_cliente", ClienteController.create)
router.put("/update_cliente", ClienteController.update)
router.delete("/delete_cliente", ClienteController.delete)

export default router
