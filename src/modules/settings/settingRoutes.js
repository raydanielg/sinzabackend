import { Router } from "express"
import * as ctrl from "./settingController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/", ctrl.listSettings)
router.put("/", hasPermission("settings.manage"), ctrl.updateSettings)

export default router
