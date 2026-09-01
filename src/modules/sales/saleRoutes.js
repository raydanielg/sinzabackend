import { Router } from "express"
import * as ctrl from "./saleController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.post("/", hasPermission("sales.create"), ctrl.createSale)
router.get("/", hasPermission("sales.view"), ctrl.listSales)
router.get("/returns", hasPermission("sales.view"), ctrl.listReturns)
router.post("/returns", hasPermission("sales.refund"), ctrl.createReturn)
router.get("/:id", hasPermission("sales.view"), ctrl.getSale)

export default router
