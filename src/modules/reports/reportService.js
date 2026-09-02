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

export async function executiveAnalytics(filters = {}) {
  const branchId = filters.branchId
  const year = parseInt(filters.year) || new Date().getFullYear()
  const withComparison = filters.withComparison === "1" || filters.withComparison === "true"

  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999)
  const prevYearStart = new Date(year - 1, 0, 1)
  const prevYearEnd = new Date(year - 1, 11, 31, 23, 59, 59, 999)

  const saleWhere = { status: "completed", createdAt: { gte: yearStart, lte: yearEnd } }
  const expenseWhere = { status: "approved", expenseDate: { gte: yearStart, lte: yearEnd } }
  const invoiceWhere = { createdAt: { gte: yearStart, lte: yearEnd } }
  const purchaseWhere = { createdAt: { gte: yearStart, lte: yearEnd } }
  if (branchId) {
    saleWhere.branchId = branchId
    expenseWhere.branchId = branchId
    invoiceWhere.branchId = branchId
    purchaseWhere.branchId = branchId
  }

  const [sales, expenses, invoices, purchases, saleItems] = await Promise.all([
    prisma.sale.findMany({ where: saleWhere, include: { items: true, payments: true } }),
    prisma.expense.findMany({ where: expenseWhere }),
    prisma.invoice.findMany({ where: invoiceWhere }),
    prisma.purchase.findMany({ where: purchaseWhere }),
    prisma.saleItem.findMany({ where: { sale: saleWhere }, include: { variant: { include: { product: true } } } }),
  ])

  // Summary cards
  const revenue = sales.reduce((sum, s) => sum + s.total, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const invoiceTotal = invoices.reduce((sum, i) => sum + i.totalAfterDiscount, 0)
  const invoicePaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0)
  const invoiceUnpaid = invoiceTotal - invoicePaid

  const billTotal = purchases.reduce((sum, p) => sum + p.totalAmount, 0)
  const billPaid = purchases.reduce((sum, p) => sum + p.paidAmount, 0)
  const billUnpaid = billTotal - billPaid

  // Monthly data
  const months = []
  for (let m = 0; m < 12; m++) {
    const label = new Date(year, m, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    months.push({
      label,
      cashIncoming: 0,
      cashOutgoing: 0,
      sales: 0,
      expenses: 0,
      netProfit: 0,
    })
  }

  for (const s of sales) {
    const m = s.createdAt.getMonth()
    months[m].sales += s.total
    const payments = s.payments || []
    for (const p of payments) {
      months[m].cashIncoming += p.amount || 0
    }
  }

  for (const e of expenses) {
    const m = (e.expenseDate || e.createdAt).getMonth()
    months[m].expenses += e.amount
    months[m].cashOutgoing += e.amount
  }

  // COGS per month
  for (const si of saleItems) {
    const m = si.sale.createdAt.getMonth()
    const cogs = si.costPrice * si.quantity
    months[m].netProfit -= cogs
  }

  for (let m = 0; m < 12; m++) {
    months[m].netProfit += months[m].sales - months[m].expenses
  }

  // Top products by revenue and qty
  const productMap = {}
  for (const si of saleItems) {
    const name = si.variant?.product?.name || "Unknown"
    if (!productMap[name]) productMap[name] = { name, revenue: 0, qty: 0 }
    productMap[name].revenue += si.total
    productMap[name].qty += si.quantity
  }

  const topByRevenue = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  const topByQty = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 10)

  // Comparison data
  let comparison = null
  if (withComparison) {
    const prevSaleWhere = { status: "completed", createdAt: { gte: prevYearStart, lte: prevYearEnd } }
    const prevExpenseWhere = { status: "approved", expenseDate: { gte: prevYearStart, lte: prevYearEnd } }
    if (branchId) {
      prevSaleWhere.branchId = branchId
      prevExpenseWhere.branchId = branchId
    }
    const [prevSales, prevExpenses] = await Promise.all([
      prisma.sale.aggregate({ where: prevSaleWhere, _sum: { total: true } }),
      prisma.expense.aggregate({ where: prevExpenseWhere, _sum: { amount: true } }),
    ])
    comparison = {
      revenue: prevSales._sum.total || 0,
      expenses: prevExpenses._sum.amount || 0,
    }
  }

  return {
    summary: {
      revenue,
      expenditures: totalExpenses,
      invoices: { total: invoiceTotal, paid: invoicePaid, unpaid: invoiceUnpaid },
      bills: { total: billTotal, paid: billPaid, unpaid: billUnpaid },
    },
    monthly: months,
    topByRevenue,
    topByQty,
    comparison,
  }
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
