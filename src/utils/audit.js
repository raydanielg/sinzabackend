import { prisma } from "../config/prisma.js"
import { logger } from "../config/logger.js"

export async function createAuditLog({ userId, companyId, branchId, action, entity, entityId, oldValues, newValues, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        companyId: companyId || null,
        branchId: branchId || null,
        action,
        entity: entity || "",
        entityId: entityId || "",
        oldValues: oldValues ? JSON.stringify(oldValues) : "",
        newValues: newValues ? JSON.stringify(newValues) : "",
        ipAddress: ipAddress || "",
      },
    })
  } catch (err) {
    logger.error({ err }, "Failed to create audit log")
  }
}
