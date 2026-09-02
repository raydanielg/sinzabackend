import { prisma } from "../../config/prisma.js"

function branchFilter(filters) {
  const where = {}
  if (filters.branchId && filters.branchId !== "all") where.branchId = filters.branchId
  return where
}

function generateNumber(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

// ==================== VENDOR CREDIT ====================

export async function listVendorCredits(filters = {}) {
  return prisma.vendorCredit.findMany({
    where: branchFilter(filters),
    include: { supplier: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createVendorCredit(data, user) {
  const amount = Number(data.amount) || 0
  return prisma.vendorCredit.create({
    data: {
      creditNumber: generateNumber("VC"),
      supplierId: data.supplierId,
      amount,
      balance: amount,
      reason: data.reason || "",
      branchId: data.branchId || user.branchId || null,
    },
    include: { supplier: true },
  })
}

// ==================== SUBSCRIPTION SALE ====================

export async function listSubscriptionSales(filters = {}) {
  return prisma.subscriptionSale.findMany({
    where: branchFilter(filters),
    include: { customer: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createSubscriptionSale(data, user) {
  return prisma.subscriptionSale.create({
    data: {
      subscriptionNumber: generateNumber("SUB"),
      customerId: data.customerId,
      planName: data.planName,
      amount: Number(data.amount) || 0,
      billingCycle: data.billingCycle || "monthly",
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      autoRenew: !!data.autoRenew,
      branchId: data.branchId || user.branchId || null,
    },
    include: { customer: true },
  })
}

// ==================== SALES REFUND ====================

export async function listSalesRefunds(filters = {}) {
  return prisma.salesRefund.findMany({
    where: branchFilter(filters),
    include: { customer: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createSalesRefund(data, user) {
  return prisma.salesRefund.create({
    data: {
      refundNumber: generateNumber("SR"),
      customerId: data.customerId,
      amount: Number(data.amount) || 0,
      reason: data.reason || "",
      refundMethod: data.refundMethod || "cash",
      branchId: data.branchId || user.branchId || null,
    },
    include: { customer: true },
  })
}

// ==================== SALES ORDER ====================

export async function listSalesOrders(filters = {}) {
  return prisma.salesOrder.findMany({
    where: branchFilter(filters),
    include: { customer: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createSalesOrder(data, user) {
  return prisma.salesOrder.create({
    data: {
      orderNumber: generateNumber("SO"),
      customerId: data.customerId,
      orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
    include: { customer: true },
  })
}

// ==================== GIVE LOAN ====================

export async function listGiveLoans(filters = {}) {
  return prisma.giveLoan.findMany({
    where: branchFilter(filters),
    include: { branch: true, repayments: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createGiveLoan(data, user) {
  const principal = Number(data.principalAmount) || 0
  const rate = Number(data.interestRate) || 0
  const totalRepayable = principal + (principal * rate / 100)
  const installments = Number(data.installments) || 1
  return prisma.giveLoan.create({
    data: {
      loanNumber: generateNumber("GL"),
      borrowerName: data.borrowerName,
      borrowerType: data.borrowerType || "customer",
      principalAmount: principal,
      interestRate: rate,
      totalRepayable,
      balance: totalRepayable,
      installmentAmount: installments > 0 ? Math.round(totalRepayable / installments) : 0,
      installments,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
  })
}

// ==================== LOAN REPAYMENT ====================

export async function listLoanRepayments(filters = {}) {
  return prisma.loanRepayment.findMany({
    where: branchFilter(filters),
    include: { loan: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createLoanRepayment(data, user) {
  const amount = Number(data.amount) || 0
  const repayment = await prisma.loanRepayment.create({
    data: {
      repaymentNumber: generateNumber("LR"),
      loanId: data.loanId,
      amount,
      principalPortion: Number(data.principalPortion) || 0,
      interestPortion: Number(data.interestPortion) || 0,
      date: data.date ? new Date(data.date) : new Date(),
      paymentMethod: data.paymentMethod || "cash",
      reference: data.reference || "",
      branchId: data.branchId || user.branchId || null,
    },
    include: { loan: true },
  })

  await prisma.giveLoan.update({
    where: { id: data.loanId },
    data: {
      paidAmount: { increment: amount },
      balance: { decrement: amount },
      paidInstallments: { increment: 1 },
    },
  })

  return repayment
}

// ==================== RECEIVE LOAN REPAYMENT ====================

export async function listReceiveLoanRepayments(filters = {}) {
  return listLoanRepayments(filters)
}

export async function createReceiveLoanRepayment(data, user) {
  return createLoanRepayment(data, user)
}

// ==================== FUND TRANSFER ====================

export async function listFundTransfers(filters = {}) {
  return prisma.fundTransfer.findMany({
    where: branchFilter(filters),
    include: { branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createFundTransfer(data, user) {
  return prisma.fundTransfer.create({
    data: {
      transferNumber: generateNumber("FT"),
      fromAccount: data.fromAccount,
      toAccount: data.toAccount,
      amount: Number(data.amount) || 0,
      fee: Number(data.fee) || 0,
      date: data.date ? new Date(data.date) : new Date(),
      reference: data.reference || "",
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
  })
}

// ==================== JOURNAL ENTRY ====================

export async function listJournalEntries(filters = {}) {
  return prisma.journalEntry.findMany({
    where: branchFilter(filters),
    include: { lines: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createJournalEntry(data, user) {
  return prisma.journalEntry.create({
    data: {
      entryNumber: generateNumber("JE"),
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description,
      reference: data.reference || "",
      lines: {
        create: (data.lines || []).map(l => ({
          accountCode: l.accountCode || "",
          accountName: l.accountName || "",
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description || "",
        })),
      },
      branchId: data.branchId || user.branchId || null,
    },
    include: { lines: true },
  })
}

// ==================== CREDIT SALE ====================

export async function listCreditSales(filters = {}) {
  return prisma.creditSale.findMany({
    where: branchFilter(filters),
    include: { customer: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createCreditSale(data, user) {
  return prisma.creditSale.create({
    data: {
      creditNumber: generateNumber("CS"),
      customerId: data.customerId,
      amount: Number(data.amount) || 0,
      interestRate: Number(data.interestRate) || 0,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
    include: { customer: true },
  })
}

// ==================== CREDIT MEMO ====================

export async function listCreditMemos(filters = {}) {
  return prisma.creditMemo.findMany({
    where: branchFilter(filters),
    include: { customer: true, branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createCreditMemo(data, user) {
  return prisma.creditMemo.create({
    data: {
      memoNumber: generateNumber("CM"),
      customerId: data.customerId,
      amount: Number(data.amount) || 0,
      reason: data.reason || "",
      branchId: data.branchId || user.branchId || null,
    },
    include: { customer: true },
  })
}

// ==================== OWNERS DRAWING ====================

export async function listOwnersDrawings(filters = {}) {
  return prisma.ownersDrawing.findMany({
    where: branchFilter(filters),
    include: { branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createOwnersDrawing(data, user) {
  return prisma.ownersDrawing.create({
    data: {
      drawingNumber: generateNumber("OD"),
      ownerName: data.ownerName,
      amount: Number(data.amount) || 0,
      date: data.date ? new Date(data.date) : new Date(),
      account: data.account || "cash",
      reason: data.reason || "",
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
  })
}

// ==================== OWNERS DEPOSIT ====================

export async function listOwnersDeposits(filters = {}) {
  return prisma.ownersDeposit.findMany({
    where: branchFilter(filters),
    include: { branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createOwnersDeposit(data, user) {
  return prisma.ownersDeposit.create({
    data: {
      depositNumber: generateNumber("ODEP"),
      ownerName: data.ownerName,
      amount: Number(data.amount) || 0,
      date: data.date ? new Date(data.date) : new Date(),
      account: data.account || "cash",
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
  })
}

// ==================== LOAN DEPOSIT ====================

export async function listLoanDeposits(filters = {}) {
  return prisma.loanDeposit.findMany({
    where: branchFilter(filters),
    include: { branch: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createLoanDeposit(data, user) {
  return prisma.loanDeposit.create({
    data: {
      loanNumber: generateNumber("LD"),
      borrowerName: data.borrowerName,
      lenderName: data.lenderName || "",
      amount: Number(data.amount) || 0,
      date: data.date ? new Date(data.date) : new Date(),
      notes: data.notes || "",
      branchId: data.branchId || user.branchId || null,
    },
  })
}
