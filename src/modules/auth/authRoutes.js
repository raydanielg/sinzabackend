import { Router } from "express"
import * as ctrl from "./authController.js"
import { authenticate } from "../../middleware/auth.js"
import { authLimiter } from "../../middleware/rateLimit.js"

const router = Router()

router.post("/login", authLimiter, ctrl.login)
router.post("/register", ctrl.register)
router.post("/forgot-password", authLimiter, ctrl.forgotPassword)
router.post("/verify-otp", ctrl.verifyOtp)
router.post("/reset-password", ctrl.resetPassword)
router.post("/refresh-token", ctrl.refreshToken)
router.get("/me", authenticate, ctrl.getMe)

export default router
