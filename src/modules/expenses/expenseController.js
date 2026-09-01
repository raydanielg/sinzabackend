import * as svc from "./expenseService.js"
import { createExpenseSchema, createExpenseCategorySchema } from "./expenseValidation.js"

export async function listExpenses(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const expenses = await svc.listExpenses(filters)
    res.json({ success: true, data: { expenses } })
  } catch (err) { next(err) }
}

export async function createExpense(req, res, next) {
  try {
    const data = createExpenseSchema.parse(req.body)
    const expense = await svc.createExpense(data, req.user)
    res.status(201).json({ success: true, data: expense })
  } catch (err) { next(err) }
}

export async function listCategories(req, res, next) {
  try {
    const categories = await svc.listCategories()
    res.json({ success: true, data: { categories } })
  } catch (err) { next(err) }
}

export async function createCategory(req, res, next) {
  try {
    const data = createExpenseCategorySchema.parse(req.body)
    const category = await svc.createCategory(data)
    res.status(201).json({ success: true, data: category })
  } catch (err) { next(err) }
}
