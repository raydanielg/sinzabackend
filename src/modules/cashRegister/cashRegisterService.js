import { prisma } from "../../config/prisma.js"
import { generateSessionNo } from "../../utils/generators.js"

export async function openSession(data, user) {
  const branchId = data.branchId || user.branchId
  if (!branchId) throw { status: 400, message: "Branch ID required" }

  const existing = await prisma.cashSession.findFirst({
    where: { cashierId: user.id, status: "open" },
  })
  if (existing) throw { status: 400, message: "You already have an open session" }

  return prisma.cashSession.create({
    data: {
      sessionNumber: generateSessionNo(),
      openingBalance: data.openingBalance,
      branchId,
      cashierId: user.id,
      status: "open",
    },
  })
}

export async function closeSession(id, data, user) {
  const session = await prisma.cashSession.findUnique({ where: { id } })
  if (!session) throw { status: 404, message: "Session not found" }
  if (session.status !== "open") throw { status: 400, message: "Session already closed" }
  if (session.cashierId !== user.id && !user.roles.includes("super_admin") && !user.roles.includes("manager")) {
    throw { status: 403, message: "Only the cashier or manager can close this session" }
  }

  const sales = await prisma.sale.findMany({
    where: {
      branchId: session.branchId,
      cashierId: session.cashierId,
      createdAt: { gte: session.openedAt },
    },
    include: { payments: true },
  })

  const cashSales = sales.flatMap((s) => s.payments).filter((p) => p.method === "cash").reduce((sum, p) => sum + p.amount, 0)
  const expectedBalance = session.openingBalance + cashSales

  const expenses = await prisma.expense.findMany({
    where: {
      branchId: session.branchId,
      createdById: session.cashierId,
      expenseDate: { gte: session.openedAt },
      paymentMethod: "cash",
    },
  })
  const cashExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const expectedAfterExpenses = expectedBalance - cashExpenses

  const difference = data.closingBalance - expectedAfterExpenses

  return prisma.cashSession.update({
    where: { id },
    data: {
      closingBalance: data.closingBalance,
      expectedBalance: expectedAfterExpenses,
      difference,
      status: "closed",
      closedAt: new Date(),
      notes: data.notes || "",
    },
  })
}

export async function listSessions(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.cashierId) where.cashierId = filters.cashierId
  if (filters.status) where.status = filters.status

  return prisma.cashSession.findMany({
    where,
    include: { branch: true, cashier: true },
    orderBy: { openedAt: "desc" },
  })
}

export async function getActiveSession(userId) {
  return prisma.cashSession.findFirst({
    where: { cashierId: userId, status: "open" },
    include: { branch: true },
  })
}
