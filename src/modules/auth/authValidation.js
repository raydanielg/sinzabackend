import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  companyId: z.string().optional(),
  branchId: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Valid email required"),
})

export const verifyOtpSchema = z.object({
  email: z.string().email("Valid email required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Valid email required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
})
