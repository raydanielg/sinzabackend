import * as svc from "./purchaseService.js"
import { createPurchaseSchema, createSupplierSchema, updateSupplierSchema, supplierPaymentSchema } from "./purchaseValidation.js"

export async function createPurchase(req, res, next) {
  try {
    const data = createPurchaseSchema.parse(req.body)
    const purchase = await svc.createPurchase(data, req.user)
    res.status(201).json({ success: true, data: purchase })
  } catch (err) { next(err) }
}

export async function receivePurchase(req, res, next) {
  try {
    const purchase = await svc.receivePurchase(req.params.id, req.user)
    res.json({ success: true, data: purchase })
  } catch (err) { next(err) }
}

export async function listPurchases(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const purchases = await svc.listPurchases(filters)
    res.json({ success: true, data: { purchases } })
  } catch (err) { next(err) }
}

export async function getPurchase(req, res, next) {
  try {
    const purchase = await svc.getPurchaseById(req.params.id)
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" })
    res.json({ success: true, data: purchase })
  } catch (err) { next(err) }
}

export async function listSuppliers(req, res, next) {
  try {
    const suppliers = await svc.listSuppliers(req.user.companyId)
    res.json({ success: true, data: { suppliers } })
  } catch (err) { next(err) }
}

export async function createSupplier(req, res, next) {
  try {
    const data = createSupplierSchema.parse(req.body)
    const supplier = await svc.createSupplier(data, req.user)
    res.status(201).json({ success: true, data: supplier })
  } catch (err) { next(err) }
}

export async function updateSupplier(req, res, next) {
  try {
    const data = updateSupplierSchema.parse(req.body)
    const supplier = await svc.updateSupplier(req.params.id, data)
    res.json({ success: true, data: supplier })
  } catch (err) { next(err) }
}

export async function deleteSupplier(req, res, next) {
  try {
    const result = await svc.deleteSupplier(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function paySupplier(req, res, next) {
  try {
    const data = supplierPaymentSchema.parse(req.body)
    const payment = await svc.paySupplier(req.params.supplierId, req.params.purchaseId, data, req.user)
    res.status(201).json({ success: true, data: payment })
  } catch (err) { next(err) }
}
