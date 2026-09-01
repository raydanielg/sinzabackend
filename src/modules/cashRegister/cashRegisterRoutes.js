import { Router } from "express"
import * as ctrl from "./cashRegisterController.js"
import { authenticate } from "../../middleware/auth.js"

const router = Router()

router.use(authenticate)

router.post("/open", ctrl.openSession)
router.put("/:id/close", ctrl.closeSession)
router.get("/", ctrl.listSessions)
router.get("/active", ctrl.getActiveSession)

export default router
