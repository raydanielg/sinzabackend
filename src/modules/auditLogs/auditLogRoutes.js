import { Router } from "express"
import * as ctrl from "./auditLogController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/", hasPermission("audit.view"), ctrl.listAuditLogs)

export default router
