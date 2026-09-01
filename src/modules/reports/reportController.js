import * as svc from "./reportService.js"

export async function dashboard(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.dashboard(filters)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function salesReport(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.salesReport(filters)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function inventoryReport(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.inventoryReport(filters)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function profitLoss(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.profitLossReport(filters)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function expensesReport(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.expensesReport(filters)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function purchasesReport(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.purchasesReport(filters)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function productsReport(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.companyId) filters.companyId = req.user.companyId
    const data = await svc.productsReport(filters)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function cashiersReport(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.cashiersReport(filters)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function branchesReport(req, res, next) {
  try {
    const filters = {}
    if (req.user.companyId) filters.companyId = req.user.companyId
    const data = await svc.branchesReport(filters)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
