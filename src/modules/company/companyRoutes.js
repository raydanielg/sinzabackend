import { Router } from "express"
import * as ctrl from "../branches/branchController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/", ctrl.getCompany)
router.put("/", hasPermission("company.manage"), ctrl.updateCompany)

export default router
