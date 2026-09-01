import { Router } from "express"
import * as ctrl from "./customerController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/", hasPermission("customers.view"), ctrl.listCustomers)
router.get("/:id", hasPermission("customers.view"), ctrl.getCustomer)
router.post("/", hasPermission("customers.create"), ctrl.createCustomer)
router.put("/:id", hasPermission("customers.update"), ctrl.updateCustomer)
router.delete("/:id", hasPermission("customers.delete"), ctrl.deleteCustomer)

export default router
