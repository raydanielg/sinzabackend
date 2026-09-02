import { Router } from "express"
import * as ctrl from "./invoiceController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.post("/", hasPermission("sales.create"), ctrl.createInvoice)
router.get("/", hasPermission("sales.view"), ctrl.listInvoices)
router.get("/:id", hasPermission("sales.view"), ctrl.getInvoice)
router.put("/:id", hasPermission("sales.create"), ctrl.updateInvoice)
router.delete("/:id", hasPermission("sales.create"), ctrl.deleteInvoice)

export default router
