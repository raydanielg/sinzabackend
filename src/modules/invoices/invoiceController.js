import * as svc from "./invoiceService.js"
import { createInvoiceSchema, updateInvoiceSchema } from "./invoiceValidation.js"

export async function createInvoice(req, res, next) {
  try {
    const data = createInvoiceSchema.parse(req.body)
    const invoice = await svc.createInvoice(data, req.user)
    res.status(201).json({ success: true, data: { invoice } })
  } catch (err) { next(err) }
}

export async function listInvoices(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const invoices = await svc.listInvoices(filters)
    res.json({ success: true, data: { invoices } })
  } catch (err) { next(err) }
}

export async function getInvoice(req, res, next) {
  try {
    const invoice = await svc.getInvoiceById(req.params.id)
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" })
    res.json({ success: true, data: invoice })
  } catch (err) { next(err) }
}

export async function updateInvoice(req, res, next) {
  try {
    const data = updateInvoiceSchema.parse(req.body)
    const invoice = await svc.updateInvoice(req.params.id, data, req.user)
    res.json({ success: true, data: { invoice } })
  } catch (err) { next(err) }
}

export async function deleteInvoice(req, res, next) {
  try {
    await svc.deleteInvoice(req.params.id, req.user)
    res.json({ success: true, message: "Invoice deleted" })
  } catch (err) { next(err) }
}
