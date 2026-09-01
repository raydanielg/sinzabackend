import * as svc from "./saleService.js"
import { createSaleSchema, createReturnSchema } from "./saleValidation.js"

export async function createSale(req, res, next) {
  try {
    const data = createSaleSchema.parse(req.body)
    const sale = await svc.createSale(data, req.user)
    res.status(201).json({ success: true, data: { sale } })
  } catch (err) { next(err) }
}

export async function listSales(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const sales = await svc.listSales(filters)
    res.json({ success: true, data: { sales } })
  } catch (err) { next(err) }
}

export async function getSale(req, res, next) {
  try {
    const sale = await svc.getSaleById(req.params.id)
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" })
    res.json({ success: true, data: sale })
  } catch (err) { next(err) }
}

export async function createReturn(req, res, next) {
  try {
    const data = createReturnSchema.parse(req.body)
    const ret = await svc.createReturn(data, req.user)
    res.status(201).json({ success: true, data: ret })
  } catch (err) { next(err) }
}

export async function listReturns(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const returns = await svc.listReturns(filters)
    res.json({ success: true, data: { returns } })
  } catch (err) { next(err) }
}
