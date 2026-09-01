import { Router } from "express"
import * as ctrl from "./inventoryController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/", hasPermission("inventory.view"), ctrl.listStock)
router.get("/low-stock", hasPermission("inventory.view"), ctrl.listLowStock)
router.get("/movements", hasPermission("inventory.view"), ctrl.listMovements)
router.get("/transfers", hasPermission("inventory.view"), ctrl.listTransfers)
router.post("/adjustments", hasPermission("inventory.adjust"), ctrl.createAdjustment)
router.post("/transfers", hasPermission("inventory.transfer"), ctrl.createTransfer)
router.put("/transfers/:id/status", hasPermission("inventory.transfer"), ctrl.updateTransferStatus)

export default router
