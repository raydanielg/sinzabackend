import * as svc from "./inventoryService.js"
import { stockAdjustmentSchema, stockTransferSchema, transferStatusSchema } from "./inventoryValidation.js"

export async function listStock(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const stocks = await svc.listStock(filters)
    res.json({ success: true, data: { stocks } })
  } catch (err) { next(err) }
}

export async function listLowStock(req, res, next) {
  try {
    const branchId = req.user.branchId && !req.user.roles.includes("super_admin") ? req.user.branchId : req.query.branchId
    const items = await svc.listLowStock(branchId)
    res.json({ success: true, data: { lowStock: items } })
  } catch (err) { next(err) }
}

export async function listMovements(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const movements = await svc.listMovements(filters)
    res.json({ success: true, data: { movements } })
  } catch (err) { next(err) }
}

export async function createAdjustment(req, res, next) {
  try {
    const data = stockAdjustmentSchema.parse(req.body)
    const result = await svc.createAdjustment(data, req.user)
    res.status(201).json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function listTransfers(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.companyId) filters.companyId = req.user.companyId
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const transfers = await svc.listTransfers(filters)
    res.json({ success: true, data: { transfers } })
  } catch (err) { next(err) }
}

export async function createTransfer(req, res, next) {
  try {
    const data = stockTransferSchema.parse(req.body)
    const transfer = await svc.createTransfer(data, req.user)
    res.status(201).json({ success: true, data: transfer })
  } catch (err) { next(err) }
}

export async function updateTransferStatus(req, res, next) {
  try {
    const data = transferStatusSchema.parse(req.body)
    const transfer = await svc.updateTransferStatus(req.params.id, data.status, req.user)
    res.json({ success: true, data: transfer })
  } catch (err) { next(err) }
}
