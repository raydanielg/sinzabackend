import { Router } from "express"
import * as ctrl from "./expenseController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/", hasPermission("expenses.view"), ctrl.listExpenses)
router.post("/", hasPermission("expenses.create"), ctrl.createExpense)
router.get("/categories/list", hasPermission("expenses.view"), ctrl.listCategories)
router.post("/categories", hasPermission("expenses.create"), ctrl.createCategory)

export default router
