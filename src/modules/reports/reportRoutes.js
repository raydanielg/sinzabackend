import { Router } from "express"
import * as ctrl from "./reportController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/dashboard", ctrl.dashboard)
router.get("/sales", hasPermission("reports.view"), ctrl.salesReport)
router.get("/inventory", hasPermission("reports.view"), ctrl.inventoryReport)
router.get("/profit", hasPermission("reports.view"), ctrl.profitLoss)
router.get("/profit-loss", hasPermission("reports.view"), ctrl.profitLoss)
router.get("/expenses", hasPermission("reports.view"), ctrl.expensesReport)
router.get("/purchases", hasPermission("reports.view"), ctrl.purchasesReport)
router.get("/products", hasPermission("reports.view"), ctrl.productsReport)
router.get("/cashiers", hasPermission("reports.view"), ctrl.cashiersReport)
router.get("/branches", hasPermission("reports.view"), ctrl.branchesReport)
router.get("/executive", hasPermission("reports.view"), ctrl.executiveAnalytics)

export default router
