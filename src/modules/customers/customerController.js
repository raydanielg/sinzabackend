import * as svc from "./customerService.js"
import { createCustomerSchema, updateCustomerSchema } from "./customerValidation.js"

export async function listCustomers(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.companyId) filters.companyId = req.user.companyId
    const customers = await svc.listCustomers(filters)
    res.json({ success: true, data: { customers } })
  } catch (err) { next(err) }
}

export async function getCustomer(req, res, next) {
  try {
    const customer = await svc.getCustomerById(req.params.id)
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" })
    res.json({ success: true, data: customer })
  } catch (err) { next(err) }
}

export async function createCustomer(req, res, next) {
  try {
    const data = createCustomerSchema.parse(req.body)
    const customer = await svc.createCustomer(data, req.user)
    res.status(201).json({ success: true, data: customer })
  } catch (err) { next(err) }
}

export async function updateCustomer(req, res, next) {
  try {
    const data = updateCustomerSchema.parse(req.body)
    const customer = await svc.updateCustomer(req.params.id, data)
    res.json({ success: true, data: customer })
  } catch (err) { next(err) }
}

export async function deleteCustomer(req, res, next) {
  try {
    const result = await svc.deleteCustomer(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}
