import { prisma } from "../../config/prisma.js"

export async function listAuditLogs(filters = {}) {
  const where = {}
  if (filters.userId) where.userId = filters.userId
  if (filters.entity) where.entity = filters.entity
  if (filters.action) where.action = filters.action
  if (filters.from || filters.to) {
    where.createdAt = {}
    if (filters.from) where.createdAt.gte = new Date(filters.from)
    if (filters.to) where.createdAt.lte = new Date(filters.to)
  }

  return prisma.auditLog.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } }, branch: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: filters.limit ? parseInt(filters.limit) : 100,
  })
}
