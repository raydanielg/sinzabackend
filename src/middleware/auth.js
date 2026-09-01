import jwt from "jsonwebtoken"
import { config } from "../config/env.js"
import { prisma } from "../config/prisma.js"
import { logger } from "../config/logger.js"

export function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn })
}

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" })
    }

    const token = header.split(" ")[1]
    const decoded = jwt.verify(token, config.jwtSecret)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
        branch: true,
        company: true,
      },
    })

    if (!user || user.status !== "active") {
      return res.status(401).json({ success: false, message: "User not found or inactive" })
    }

    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name)
    )

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      companyId: user.companyId,
      branchId: user.branchId,
      permissions,
      roles: user.userRoles.map((ur) => ur.role.name),
      branch: user.branch,
      company: user.company,
    }

    next()
  } catch (err) {
    logger.error({ err }, "Auth error")
    return res.status(401).json({ success: false, message: "Invalid or expired token" })
  }
}

export function requireBranchAccess(req, res, next) {
  if (!req.user) return next()

  const roles = req.user.roles || []
  if (roles.includes("super_admin")) return next()

  const requestedBranchId = req.params.branchId || req.body.branchId || req.query.branchId

  if (requestedBranchId && req.user.branchId && requestedBranchId !== req.user.branchId) {
    return res.status(403).json({ success: false, message: "Access denied: branch mismatch" })
  }

  if (req.body.branchId && req.user.branchId) {
    req.body.branchId = req.user.branchId
  }

  next()
}
