import * as svc from "./hrService.js"

// ==================== DEPARTMENTS ====================

export async function listDepartments(req, res, next) {
  try {
    const data = await svc.listDepartments(req.user.companyId)
    res.json({ success: true, data: { departments: data } })
  } catch (err) { next(err) }
}

export async function createDepartment(req, res, next) {
  try {
    const data = await svc.createDepartment(req.body, req.user)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

export async function updateDepartment(req, res, next) {
  try {
    const data = await svc.updateDepartment(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function deleteDepartment(req, res, next) {
  try {
    await svc.deleteDepartment(req.params.id)
    res.json({ success: true, message: "Department deleted" })
  } catch (err) { next(err) }
}

// ==================== EMPLOYEES ====================

export async function listEmployees(req, res, next) {
  try {
    const filters = { ...req.query, companyId: req.user.companyId }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.listEmployees(filters)
    res.json({ success: true, data: { employees: data } })
  } catch (err) { next(err) }
}

export async function getEmployee(req, res, next) {
  try {
    const data = await svc.getEmployee(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Employee not found" })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function createEmployee(req, res, next) {
  try {
    const data = await svc.createEmployee(req.body, req.user)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

export async function updateEmployee(req, res, next) {
  try {
    const data = await svc.updateEmployee(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function deleteEmployee(req, res, next) {
  try {
    await svc.deleteEmployee(req.params.id)
    res.json({ success: true, message: "Employee deleted" })
  } catch (err) { next(err) }
}

// ==================== ATTENDANCE ====================

export async function listAttendance(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.listAttendance(filters)
    res.json({ success: true, data: { attendance: data } })
  } catch (err) { next(err) }
}

export async function createAttendance(req, res, next) {
  try {
    const data = await svc.createAttendance(req.body, req.user)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

// ==================== PAYROLL ====================

export async function listPayroll(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.listPayroll(filters)
    res.json({ success: true, data: { payrolls: data } })
  } catch (err) { next(err) }
}

export async function createPayroll(req, res, next) {
  try {
    const data = await svc.createPayroll(req.body, req.user)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

export async function updatePayrollStatus(req, res, next) {
  try {
    const data = await svc.updatePayrollStatus(req.params.id, req.body.status, req.body)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

// ==================== LEAVE REQUESTS ====================

export async function listLeaveRequests(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.listLeaveRequests(filters)
    res.json({ success: true, data: { leaveRequests: data } })
  } catch (err) { next(err) }
}

export async function createLeaveRequest(req, res, next) {
  try {
    const data = await svc.createLeaveRequest(req.body, req.user)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

export async function approveLeaveRequest(req, res, next) {
  try {
    const data = await svc.approveLeaveRequest(req.params.id, req.user, req.body.approved)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
