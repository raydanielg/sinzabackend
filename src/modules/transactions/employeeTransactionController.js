import * as svc from "./employeeTransactionService.js"

// Employee Allowances
export async function listEmployeeAllowances(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.listEmployeeAllowances(filters)
    res.json({ success: true, data: { employeeAllowances: data, allowances: data } })
  } catch (err) { next(err) }
}

export async function createEmployeeAllowance(req, res, next) {
  try {
    const data = await svc.createEmployeeAllowance(req.body, req.user)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

// Employee Deductions
export async function listEmployeeDeductions(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.listEmployeeDeductions(filters)
    res.json({ success: true, data: { employeeDeductions: data, deductions: data } })
  } catch (err) { next(err) }
}

export async function createEmployeeDeduction(req, res, next) {
  try {
    const data = await svc.createEmployeeDeduction(req.body, req.user)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

// Employee Loans
export async function listEmployeeLoans(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.listEmployeeLoans(filters)
    res.json({ success: true, data: { employeeLoans: data, loans: data } })
  } catch (err) { next(err) }
}

export async function createEmployeeLoan(req, res, next) {
  try {
    const data = await svc.createEmployeeLoan(req.body, req.user)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

// Payroll Liabilities
export async function listPayrollLiabilities(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.listPayrollLiabilities(filters)
    res.json({ success: true, data: { payrollLiabilities: data, liabilities: data } })
  } catch (err) { next(err) }
}

export async function createPayrollLiability(req, res, next) {
  try {
    const data = await svc.createPayrollLiability(req.body, req.user)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

// Mid Month Payrolls
export async function listMidMonthPayrolls(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.listMidMonthPayrolls(filters)
    res.json({ success: true, data: { midMonthPayrolls: data, payrolls: data } })
  } catch (err) { next(err) }
}

export async function createMidMonthPayroll(req, res, next) {
  try {
    const data = await svc.createMidMonthPayroll(req.body, req.user)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}
