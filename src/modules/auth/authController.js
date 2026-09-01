import * as authService from "./authService.js"
import { loginSchema, registerSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema, refreshTokenSchema } from "./authValidation.js"

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body)
    const result = await authService.login(data.email, data.password)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body)
    const result = await authService.register(data)
    res.status(201).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const data = forgotPasswordSchema.parse(req.body)
    await authService.forgotPassword(data.email)
    res.json({ success: true, message: "OTP sent to email if account exists" })
  } catch (err) {
    next(err)
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const data = verifyOtpSchema.parse(req.body)
    const result = await authService.verifyOtp(data.email, data.otp)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const data = resetPasswordSchema.parse(req.body)
    const result = await authService.resetPassword(data.email, data.otp, data.password)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function refreshToken(req, res, next) {
  try {
    const data = refreshTokenSchema.parse(req.body)
    const result = await authService.refreshToken(data.refreshToken)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id)
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}
