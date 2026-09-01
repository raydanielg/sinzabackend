import { prisma } from "../../config/prisma.js"

export async function listExpenses(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.categoryId) where.categoryId = filters.categoryId
  if (filters.from || filters.to) {
    where.expenseDate = {}
    if (filters.from) where.expenseDate.gte = new Date(filters.from)
    if (filters.to) where.expenseDate.lte = new Date(filters.to)
  }

  return prisma.expense.findMany({
    where,
    include: { category: true, branch: true, createdBy: true },
    orderBy: { expenseDate: "desc" },
  })
}

export async function createExpense(data, user) {
  const branchId = data.branchId || user.branchId
  if (!branchId) throw { status: 400, message: "Branch ID required" }

  return prisma.expense.create({
    data: {
      amount: data.amount,
      description: data.description || "",
      paymentMethod: data.paymentMethod,
      expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
      categoryId: data.categoryId || null,
      companyId: user.companyId || "",
      branchId,
      createdById: user.id,
    },
  })
}

export async function listCategories() {
  return prisma.expenseCategory.findMany({ orderBy: { name: "asc" } })
}

export async function createCategory(data) {
  return prisma.expenseCategory.create({ data: { name: data.name } })
}
