import { prisma } from "../../config/prisma.js"

// ==================== EMPLOYEE ALLOWANCE ====================

export async function listEmployeeAllowances(filters = {}) {
  const where = {}
  if (filters.branchId && filters.branchId !== "all") where.branchId = filters.branchId
  if (filters.employeeId) where.employeeId = filters.employeeId

  return prisma.employeeAllowance.findMany({
    where,
    include: { employee: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createEmployeeAllowance(data, user) {
  return prisma.employeeAllowance.create({
    data: {
      employeeId: data.employeeId,
      type: data.type,
      amount: Number(data.amount) || 0,
      frequency: data.frequency || "monthly",
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status || "active",
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
    include: { employee: true },
  })
}

// ==================== EMPLOYEE DEDUCTION ====================

export async function listEmployeeDeductions(filters = {}) {
  const where = {}
  if (filters.branchId && filters.branchId !== "all") where.branchId = filters.branchId
  if (filters.employeeId) where.employeeId = filters.employeeId

  return prisma.employeeDeduction.findMany({
    where,
    include: { employee: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createEmployeeDeduction(data, user) {
  return prisma.employeeDeduction.create({
    data: {
      employeeId: data.employeeId,
      type: data.type,
      amount: Number(data.amount) || 0,
      frequency: data.frequency || "monthly",
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status || "active",
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
    include: { employee: true },
  })
}

// ==================== EMPLOYEE LOAN ====================

export async function listEmployeeLoans(filters = {}) {
  const where = {}
  if (filters.branchId && filters.branchId !== "all") where.branchId = filters.branchId
  if (filters.employeeId) where.employeeId = filters.employeeId

  return prisma.employeeLoan.findMany({
    where,
    include: { employee: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createEmployeeLoan(data, user) {
  const count = await prisma.employeeLoan.count()
  const loanNumber = `ELN-${String(count + 1).padStart(5, "0")}`

  const principalAmount = Number(data.principalAmount) || 0
  const interestRate = Number(data.interestRate) || 0
  const totalRepayable = principalAmount + (principalAmount * interestRate / 100)
  const installments = Number(data.installments) || 1
  const installmentAmount = Math.ceil(totalRepayable / installments)

  return prisma.employeeLoan.create({
    data: {
      loanNumber,
      employeeId: data.employeeId,
      principalAmount,
      interestRate,
      totalRepayable,
      paidAmount: 0,
      balance: totalRepayable,
      installmentAmount,
      installments,
      paidInstallments: 0,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      status: data.status || "active",
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
    include: { employee: true },
  })
}

// ==================== PAYROLL LIABILITY ====================

export async function listPayrollLiabilities(filters = {}) {
  const where = {}
  if (filters.branchId && filters.branchId !== "all") where.branchId = filters.branchId
  if (filters.employeeId) where.employeeId = filters.employeeId

  return prisma.payrollLiability.findMany({
    where,
    include: { employee: true, payroll: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createPayrollLiability(data, user) {
  const count = await prisma.payrollLiability.count()
  const liabilityNumber = `PL-${String(count + 1).padStart(5, "0")}`

  const amount = Number(data.amount) || 0

  return prisma.payrollLiability.create({
    data: {
      liabilityNumber,
      employeeId: data.employeeId,
      payrollId: data.payrollId || null,
      type: data.type,
      amount,
      paidAmount: 0,
      balance: amount,
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
      status: data.status || "pending",
      branchId: data.branchId || user.branchId || null,
    },
    include: { employee: true },
  })
}

// ==================== MID MONTH PAYROLL ====================

export async function listMidMonthPayrolls(filters = {}) {
  const where = {}
  if (filters.branchId && filters.branchId !== "all") where.branchId = filters.branchId
  if (filters.employeeId) where.employeeId = filters.employeeId

  return prisma.midMonthPayroll.findMany({
    where,
    include: { employee: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createMidMonthPayroll(data, user) {
  const count = await prisma.midMonthPayroll.count()
  const midMonthNumber = `MMP-${String(count + 1).padStart(5, "0")}`

  return prisma.midMonthPayroll.create({
    data: {
      midMonthNumber,
      employeeId: data.employeeId,
      amount: Number(data.amount) || 0,
      month: Number(data.month) || new Date().getMonth() + 1,
      year: Number(data.year) || new Date().getFullYear(),
      status: data.status || "pending",
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
    include: { employee: true },
  })
}
