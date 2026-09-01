import { Router } from "express"
import * as ctrl from "./purchaseController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/", hasPermission("purchases.view"), ctrl.listPurchases)
router.get("/:id", hasPermission("purchases.view"), ctrl.getPurchase)
router.post("/", hasPermission("purchases.create"), ctrl.createPurchase)
router.put("/:id/receive", hasPermission("purchases.create"), ctrl.receivePurchase)

router.get("/suppliers/list", hasPermission("purchases.view"), ctrl.listSuppliers)
router.post("/suppliers", hasPermission("purchases.create"), ctrl.createSupplier)
router.put("/suppliers/:id", hasPermission("purchases.update"), ctrl.updateSupplier)
router.delete("/suppliers/:id", hasPermission("purchases.delete"), ctrl.deleteSupplier)
router.post("/suppliers/:supplierId/payments/:purchaseId", hasPermission("purchases.create"), ctrl.paySupplier)

export default router
