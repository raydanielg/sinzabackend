import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../../config/prisma.js"
import { config } from "../../config/env.js"
import { generateOtp } from "../../utils/generators.js"
import { sendOtpEmail } from "../../utils/mailer.js"
import { generateAccessToken, generateRefreshToken } from "../../middleware/auth.js"

export async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
      branch: true,
      company: true,
    },
  })

  if (!user) throw { status: 401, message: "Invalid credentials" }
  if (user.status !== "active") throw { status: 403, message: "Account is inactive" }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw { status: 401, message: "Invalid credentials" }

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

  const permissions = user.userRoles.flatMap((ur) =>
    ur.role.rolePermissions.map((rp) => rp.permission.name)
  )
  const roles = user.userRoles.map((ur) => ur.role.name)

  const payload = { userId: user.id, companyId: user.companyId, branchId: user.branchId }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles,
      permissions,
      branch: user.branch,
      company: user.company,
    },
    accessToken,
    refreshToken,
  }
}

export async function register(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw { status: 409, message: "Email already registered" }

  const hashed = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      phone: data.phone || "",
      companyId: data.companyId || null,
      branchId: data.branchId || null,
      isEmailVerified: false,
    },
  })

  const cashierRole = await prisma.role.findUnique({ where: { name: "cashier" } })
  if (cashierRole) {
    await prisma.userRole.create({ data: { userId: user.id, roleId: cashierRole.id } })
  }

  const payload = { userId: user.id, companyId: user.companyId, branchId: user.branchId }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  return { user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken }
}

export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return

  const otp = generateOtp()
  const expires = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { resetOtp: otp, resetOtpExpires: expires },
  })

  await sendOtpEmail(email, otp)
}

export async function verifyOtp(email, otp) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.resetOtp || !user.resetOtpExpires) {
    throw { status: 400, message: "No OTP requested" }
  }
  if (user.resetOtp !== otp) throw { status: 400, message: "Invalid OTP" }
  if (user.resetOtpExpires < new Date()) throw { status: 400, message: "OTP expired" }

  return { verified: true }
}

export async function resetPassword(email, otp, password) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.resetOtp || !user.resetOtpExpires) {
    throw { status: 400, message: "No OTP requested" }
  }
  if (user.resetOtp !== otp) throw { status: 400, message: "Invalid OTP" }
  if (user.resetOtpExpires < new Date()) throw { status: 400, message: "OTP expired" }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetOtp: null, resetOtpExpires: null },
  })

  return { success: true }
}

export async function refreshToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret)
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user || user.status !== "active") throw { status: 401, message: "Invalid user" }

    const payload = { userId: user.id, companyId: user.companyId, branchId: user.branchId }
    const accessToken = generateAccessToken(payload)
    const newRefreshToken = generateRefreshToken(payload)

    return { accessToken, refreshToken: newRefreshToken }
  } catch {
    throw { status: 401, message: "Invalid refresh token" }
  }
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
      branch: true,
      company: true,
    },
  })

  if (!user) throw { status: 404, message: "User not found" }

  const permissions = user.userRoles.flatMap((ur) =>
    ur.role.rolePermissions.map((rp) => rp.permission.name)
  )
  const roles = user.userRoles.map((ur) => ur.role.name)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles,
    permissions,
    branch: user.branch,
    company: user.company,
  }
}
