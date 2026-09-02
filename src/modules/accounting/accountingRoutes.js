import { Router } from "express"
import * as ctrl from "./accountingController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/groups", ctrl.listGroups)
router.post("/groups", hasPermission("accounting.create"), ctrl.createGroup)

router.get("/banking", ctrl.bankingOverview)

router.get("/", ctrl.listAccounts)
router.post("/", hasPermission("accounting.create"), ctrl.createAccount)
router.get("/:id", ctrl.getAccount)
router.put("/:id", hasPermission("accounting.create"), ctrl.updateAccount)
router.delete("/:id", hasPermission("accounting.create"), ctrl.deleteAccount)

export default router
