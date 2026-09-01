import { Router } from "express"
import * as ctrl from "./notificationController.js"
import { authenticate } from "../../middleware/auth.js"

const router = Router()

router.use(authenticate)

router.get("/", ctrl.listNotifications)
router.put("/:id/read", ctrl.markAsRead)
router.put("/read-all", ctrl.markAllAsRead)

export default router
