import { prisma } from "../../config/prisma.js"

export async function listNotifications(userId, filters = {}) {
  const where = { userId }
  if (filters.isRead !== undefined) where.isRead = filters.isRead === "true"

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function markAsRead(id) {
  return prisma.notification.update({ where: { id }, data: { isRead: true } })
}

export async function markAllAsRead(userId) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
  return { success: true }
}

export async function createNotification(data) {
  return prisma.notification.create({ data })
}
