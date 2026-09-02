import { prisma } from "../../config/prisma.js"

// ==================== DEPARTMENTS ====================

export async function listDepartments(companyId) {
  return prisma.department.findMany({
    where: { companyId },
    include: {
      branch: true,
      _count: { select: { employees: true } },
    },
    orderBy: { name: "asc" },
  })
}

export async function createDepartment(data, user) {
  return prisma.department.create({
    data: {
      name: data.name,
      description: data.description || "",
      companyId: user.companyId,
      branchId: data.branchId || null,
    },
  })
}

export async function updateDepartment(id, data) {
  return prisma.department.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      branchId: data.branchId || null,
    },
  })
}

export async function deleteDepartment(id) {
  return prisma.department.delete({ where: { id } })
}

// ==================== EMPLOYEES ====================

export async function listEmployees(filters = {}) {
  const where = {}
  if (filters.companyId) where.companyId = filters.companyId
  if (filters.branchId && filters.branchId !== "all") where.branchId = filters.branchId
  if (filters.departmentId) where.departmentId = filters.departmentId
  if (filters.status) where.status = filters.status

  return prisma.employee.findMany({
    where,
    include: {
      department: true,
      branch: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getEmployee(id) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      branch: true,
      user: true,
    },
  })
}

export async function createEmployee(data, user) {
  const count = await prisma.employee.count({ where: { companyId: user.companyId } })
  const employeeNumber = `EMP-${String(count + 1).padStart(4, "0")}`

  return prisma.employee.create({
    data: {
      employeeNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || "",
      address: data.address || "",
      gender: data.gender || "male",
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      position: data.position,
      employmentType: data.employmentType || "full_time",
      hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
      salary: Number(data.salary) || 0,
      allowance: Number(data.allowance) || 0,
      status: data.status || "active",
      companyId: user.companyId,
      branchId: data.branchId || null,
      departmentId: data.departmentId || null,
    },
    include: { department: true, branch: true },
  })
}

export async function updateEmployee(id, data) {
  return prisma.employee.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      position: data.position,
      employmentType: data.employmentType,
      hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      salary: Number(data.salary) || 0,
      allowance: Number(data.allowance) || 0,
      status: data.status,
      branchId: data.branchId || null,
      departmentId: data.departmentId || null,
    },
    include: { department: true, branch: true },
  })
}

export async function deleteEmployee(id) {
  return prisma.employee.delete({ where: { id } })
}

// ==================== ATTENDANCE ====================

export async function listAttendance(filters = {}) {
  const where = {}
  if (filters.branchId && filters.branchId !== "all") where.branchId = filters.branchId
  if (filters.employeeId) where.employeeId = filters.employeeId
  if (filters.from || filters.to) {
    where.date = {}
    if (filters.from) where.date.gte = new Date(filters.from)
    if (filters.to) where.date.lte = new Date(filters.to)
  }

  return prisma.attendance.findMany({
    where,
    include: { employee: true, branch: true },
    orderBy: { date: "desc" },
  })
}

export async function createAttendance(data, user) {
  return prisma.attendance.create({
    data: {
      employeeId: data.employeeId,
      date: data.date ? new Date(data.date) : new Date(),
      checkIn: data.checkIn ? new Date(data.checkIn) : null,
      checkOut: data.checkOut ? new Date(data.checkOut) : null,
      status: data.status || "present",
      notes: data.notes || "",
      workHours: Number(data.workHours) || 0,
      overtimeHours: Number(data.overtimeHours) || 0,
      branchId: data.branchId || user.branchId || null,
    },
    include: { employee: true },
  })
}

// ==================== PAYROLL ====================

export async function listPayroll(filters = {}) {
  const where = {}
  if (filters.branchId && filters.branchId !== "all") where.branchId = filters.branchId
  if (filters.employeeId) where.employeeId = filters.employeeId
  if (filters.year) where.year = Number(filters.year)
  if (filters.month) where.month = Number(filters.month)

  return prisma.payroll.findMany({
    where,
    include: { employee: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createPayroll(data, user) {
  const count = await prisma.payroll.count()
  const payrollNumber = `PAY-${String(count + 1).padStart(5, "0")}`

  const basicSalary = Number(data.basicSalary) || 0
  const allowances = Number(data.allowances) || 0
  const overtimePay = Number(data.overtimePay) || 0
  const deductions = Number(data.deductions) || 0
  const taxDeduction = Number(data.taxDeduction) || 0
  const netPay = basicSalary + allowances + overtimePay - deductions - taxDeduction

  return prisma.payroll.create({
    data: {
      payrollNumber,
      employeeId: data.employeeId,
      month: Number(data.month) || new Date().getMonth() + 1,
      year: Number(data.year) || new Date().getFullYear(),
      basicSalary,
      allowances,
      overtimePay,
      deductions,
      taxDeduction,
      netPay,
      status: data.status || "pending",
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
      paymentMethod: data.paymentMethod || "",
      reference: data.reference || "",
      branchId: data.branchId || user.branchId || null,
    },
    include: { employee: true, branch: true },
  })
}

export async function updatePayrollStatus(id, status, paymentData = {}) {
  return prisma.payroll.update({
    where: { id },
    data: {
      status,
      paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate) : new Date(),
      paymentMethod: paymentData.paymentMethod || "",
      reference: paymentData.reference || "",
    },
    include: { employee: true },
  })
}

// ==================== LEAVE REQUESTS ====================

export async function listLeaveRequests(filters = {}) {
  const where = {}
  if (filters.branchId && filters.branchId !== "all") where.branchId = filters.branchId
  if (filters.employeeId) where.employeeId = filters.employeeId
  if (filters.status) where.status = filters.status

  return prisma.leaveRequest.findMany({
    where,
    include: { employee: true, branch: true, approvedBy: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createLeaveRequest(data, user) {
  const count = await prisma.leaveRequest.count()
  const leaveNumber = `LV-${String(count + 1).padStart(5, "0")}`

  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1

  return prisma.leaveRequest.create({
    data: {
      leaveNumber,
      employeeId: data.employeeId,
      type: data.type || "annual",
      startDate,
      endDate,
      days: data.days || days,
      reason: data.reason || "",
      status: "pending",
      branchId: data.branchId || user.branchId || null,
    },
    include: { employee: true },
  })
}

export async function approveLeaveRequest(id, user, approved) {
  return prisma.leaveRequest.update({
    where: { id },
    data: {
      status: approved ? "approved" : "rejected",
      approvedById: user.id,
      approvedAt: new Date(),
    },
    include: { employee: true, approvedBy: true },
  })
}
