import { prisma } from "../../config/prisma.js"

export async function dashboard(filters = {}) {
  const branchId = filters.branchId
  const where = branchId ? { branchId } : {}

  const [sales, products, customers, expenses, lowStockItems, outOfStockItems] = await Promise.all([
    prisma.sale.aggregate({ where: { ...where, status: "completed" }, _sum: { total: true } }),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.expense.aggregate({ where: { ...where, status: "approved" }, _sum: { amount: true } }),
    prisma.branchStock.findMany({ where: branchId ? { branchId } : {}, include: { variant: true } }),
    prisma.branchStock.findMany({ where: { ...(branchId ? { branchId } : {}), quantity: 0 }, include: { variant: true } }),
  ])

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todaySales = await prisma.sale.aggregate({
    where: { ...where, status: "completed", createdAt: { gte: todayStart } },
    _sum: { total: true },
    _count: true,
  })

  const cogs = await prisma.saleItem.aggregate({
    where: { sale: { ...where, status: "completed" } },
    _sum: { costPrice: true, quantity: true },
  })

  const revenue = sales._sum.total || 0
  const totalExpenses = expenses._sum.amount || 0
  const costOfGoods = (cogs._sum.costPrice || 0) * (cogs._sum.quantity || 0)
  const grossProfit = revenue - costOfGoods
  const netProfit = grossProfit - totalExpenses

  const lowStock = lowStockItems.filter((s) => s.quantity <= s.reorderLevel && s.quantity > 0).length

  return {
    totalSales: revenue,
    todaySales: todaySales._sum.total || 0,
    todayTransactions: todaySales._count || 0,
    totalProducts: products,
    lowStock,
    outOfStock: outOfStockItems.length,
    customers,
    totalExpenses,
    grossProfit,
    netProfit,
  }
}

export async function salesReport(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.cashierId) where.cashierId = filters.cashierId
  if (filters.from || filters.to) {
    where.createdAt = {}
    if (filters.from) where.createdAt.gte = new Date(filters.from)
    if (filters.to) where.createdAt.lte = new Date(filters.to)
  }

  const sales = await prisma.sale.findMany({
    where: { ...where, status: "completed" },
    include: { items: true, payments: true, cashier: true, branch: true, customer: true },
    orderBy: { createdAt: "desc" },
  })

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)
  const totalCogs = sales.flatMap((s) => s.items).reduce((sum, item) => sum + item.costPrice * item.quantity, 0)
  const grossProfit = totalRevenue - totalCogs

  return { sales, totalRevenue, totalCogs, grossProfit, count: sales.length }
}

export async function inventoryReport(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId

  const stocks = await prisma.branchStock.findMany({
    where,
    include: { variant: { include: { product: { include: { category: true } }, size: true, color: true } }, branch: true },
  })

  const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0)
  const stockValue = stocks.reduce((sum, s) => sum + s.quantity * s.variant.costPrice, 0)
  const retailValue = stocks.reduce((sum, s) => sum + s.quantity * s.variant.sellingPrice, 0)
  const lowStock = stocks.filter((s) => s.quantity <= s.reorderLevel && s.quantity > 0)
  const outOfStock = stocks.filter((s) => s.quantity === 0)

  return { stocks, totalStock, stockValue, retailValue, lowStock, outOfStock }
}

export async function profitLossReport(filters = {}) {
  const salesData = await salesReport(filters)
  const expenseWhere = {}
  if (filters.branchId) expenseWhere.branchId = filters.branchId
  if (filters.from || filters.to) {
    expenseWhere.expenseDate = {}
    if (filters.from) expenseWhere.expenseDate.gte = new Date(filters.from)
    if (filters.to) expenseWhere.expenseDate.lte = new Date(filters.to)
  }

  const expenses = await prisma.expense.aggregate({ where: { ...expenseWhere, status: "approved" }, _sum: { amount: true } })
  const totalExpenses = expenses._sum.amount || 0
  const netProfit = salesData.grossProfit - totalExpenses
  const profitMargin = salesData.totalRevenue > 0 ? ((netProfit / salesData.totalRevenue) * 100).toFixed(2) : "0.00"

  return {
    revenue: salesData.totalRevenue,
    cogs: salesData.totalCogs,
    grossProfit: salesData.grossProfit,
    totalExpenses,
    netProfit,
    profitMargin,
  }
}

export async function expensesReport(filters = {}) {
  const where = { status: "approved" }
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.from || filters.to) {
    where.expenseDate = {}
    if (filters.from) where.expenseDate.gte = new Date(filters.from)
    if (filters.to) where.expenseDate.lte = new Date(filters.to)
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true, branch: true, createdBy: true },
    orderBy: { expenseDate: "desc" },
  })

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category?.name || "Other"
    acc[cat] = (acc[cat] || 0) + e.amount
    return acc
  }, {})

  return { expenses, total, byCategory }
}

export async function purchasesReport(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.supplierId) where.supplierId = filters.supplierId
  if (filters.from || filters.to) {
    where.createdAt = {}
    if (filters.from) where.createdAt.gte = new Date(filters.from)
    if (filters.to) where.createdAt.lte = new Date(filters.to)
  }

  const purchases = await prisma.purchase.findMany({
    where,
    include: { supplier: true, branch: true, items: true },
    orderBy: { createdAt: "desc" },
  })

  const total = purchases.reduce((sum, p) => sum + p.totalAmount, 0)
  const totalPaid = purchases.reduce((sum, p) => sum + p.paidAmount, 0)
  const totalBalance = purchases.reduce((sum, p) => sum + p.balance, 0)

  return { purchases, total, totalPaid, totalBalance }
}

export async function productsReport(filters = {}) {
  const where = {}
  if (filters.companyId) where.companyId = filters.companyId
  if (filters.categoryId) where.categoryId = filters.categoryId

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      brand: true,
      variants: { include: { stocks: true, saleItems: true } },
    },
  })

  const report = products.map((p) => {
    const totalStock = p.variants.flatMap((v) => v.stocks).reduce((sum, s) => sum + s.quantity, 0)
    const totalSold = p.variants.flatMap((v) => v.saleItems).reduce((sum, si) => sum + si.quantity, 0)
    const revenue = p.variants.flatMap((v) => v.saleItems).reduce((sum, si) => sum + si.total, 0)
    return { id: p.id, name: p.name, category: p.category?.name, totalStock, totalSold, revenue }
  })

  return { products: report }
}

export async function cashiersReport(filters = {}) {
  const where = { status: "completed" }
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.from || filters.to) {
    where.createdAt = {}
    if (filters.from) where.createdAt.gte = new Date(filters.from)
    if (filters.to) where.createdAt.lte = new Date(filters.to)
  }

  const sales = await prisma.sale.findMany({
    where,
    include: { cashier: true, items: true },
  })

  const byCashier = sales.reduce((acc, s) => {
    const name = s.cashier?.name || "Unknown"
    if (!acc[name]) acc[name] = { name, sales: 0, revenue: 0, items: 0 }
    acc[name].sales += 1
    acc[name].revenue += s.total
    acc[name].items += s.items.length
    return acc
  }, {})

  return { cashiers: Object.values(byCashier) }
}

export async function branchesReport(filters = {}) {
  const branches = await prisma.branch.findMany({
    where: filters.companyId ? { companyId: filters.companyId } : {},
    include: {
      _count: { select: { sales: true, purchases: true, users: true } },
    },
  })

  const report = await Promise.all(
    branches.map(async (b) => {
      const sales = await prisma.sale.aggregate({ where: { branchId: b.id, status: "completed" }, _sum: { total: true } })
      const expenses = await prisma.expense.aggregate({ where: { branchId: b.id, status: "approved" }, _sum: { amount: true } })
      return {
        id: b.id,
        name: b.name,
        code: b.code,
        totalSales: sales._sum.total || 0,
        totalExpenses: expenses._sum.amount || 0,
        salesCount: b._count.sales,
        purchasesCount: b._count.purchases,
        usersCount: b._count.users,
      }
    })
  )

  return { branches: report }
}
