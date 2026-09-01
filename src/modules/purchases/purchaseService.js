import { prisma } from "../../config/prisma.js"
import { generatePurchaseNo } from "../../utils/generators.js"
import { createAuditLog } from "../../utils/audit.js"

export async function createPurchase(data, user) {
  const branchId = data.branchId || user.branchId
  if (!branchId) throw { status: 400, message: "Branch ID required" }

  let subtotal = 0
  const items = data.items.map((item) => {
    const lineTotal = item.quantity * item.unitCost
    subtotal += lineTotal
    return { variantId: item.variantId, quantity: item.quantity, unitCost: item.unitCost, total: lineTotal }
  })

  const discount = data.discount || 0
  const totalAmount = subtotal - discount
  const purchaseNumber = generatePurchaseNo()

  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        purchaseNumber,
        subtotal,
        discount,
        totalAmount,
        balance: totalAmount,
        status: "pending",
        note: data.note || "",
        companyId: user.companyId || "",
        branchId,
        supplierId: data.supplierId,
        createdById: user.id,
        items: { create: items },
      },
      include: { items: true, supplier: true },
    })

    await createAuditLog({ userId: user.id, companyId: user.companyId, branchId, action: "PURCHASE_CREATED", entity: "Purchase", entityId: purchase.id, newValues: { purchaseNumber, totalAmount } })

    return purchase
  })
}

export async function receivePurchase(id, user) {
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { items: true },
  })
  if (!purchase) throw { status: 404, message: "Purchase not found" }
  if (purchase.status === "received") throw { status: 400, message: "Purchase already received" }

  return prisma.$transaction(async (tx) => {
    for (const item of purchase.items) {
      const stock = await tx.branchStock.findUnique({
        where: { branchId_variantId: { branchId: purchase.branchId, variantId: item.variantId } },
      })
      const prevQty = stock?.quantity || 0
      const newQty = prevQty + item.quantity

      if (stock) {
        await tx.branchStock.update({ where: { id: stock.id }, data: { quantity: newQty } })
      } else {
        await tx.branchStock.create({ data: { branchId: purchase.branchId, variantId: item.variantId, quantity: newQty } })
      }

      await tx.stockMovement.create({
        data: {
          branchId: purchase.branchId, variantId: item.variantId, type: "PURCHASE",
          quantity: item.quantity, referenceType: "PURCHASE", referenceId: purchase.id,
          previousQuantity: prevQty, newQuantity: newQty, createdBy: user.id,
        },
      })

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { costPrice: item.unitCost },
      })
    }

    const updated = await tx.purchase.update({ where: { id }, data: { status: "received" } })
    await createAuditLog({ userId: user.id, branchId: purchase.branchId, action: "PURCHASE_RECEIVED", entity: "Purchase", entityId: id })
    return updated
  })
}

export async function listPurchases(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.supplierId) where.supplierId = filters.supplierId
  if (filters.status) where.status = filters.status

  return prisma.purchase.findMany({
    where,
    include: { supplier: true, branch: true, createdBy: true, items: { include: { variant: { include: { product: true } } } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getPurchaseById(id) {
  return prisma.purchase.findUnique({
    where: { id },
    include: { supplier: true, branch: true, createdBy: true, items: { include: { variant: { include: { product: true, size: true, color: true } } } }, payments: true },
  })
}

// Suppliers
export async function listSuppliers(companyId) {
  return prisma.supplier.findMany({
    where: companyId ? { companyId } : {},
    include: { _count: { select: { purchases: true } } },
    orderBy: { name: "asc" },
  })
}

export async function createSupplier(data, user) {
  return prisma.supplier.create({
    data: {
      name: data.name,
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      tin: data.tin || "",
      companyId: data.companyId || user?.companyId || null,
    },
  })
}

export async function updateSupplier(id, data) {
  return prisma.supplier.update({ where: { id }, data })
}

export async function deleteSupplier(id) {
  await prisma.supplier.delete({ where: { id } })
  return { success: true }
}

export async function paySupplier(supplierId, purchaseId, data, user) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.supplierPayment.create({
      data: { supplierId, purchaseId, amount: data.amount, method: data.method, reference: data.reference || "" },
    })

    await tx.purchase.update({
      where: { id: purchaseId },
      data: { paidAmount: { increment: data.amount }, balance: { decrement: data.amount } },
    })

    await tx.supplier.update({
      where: { id: supplierId },
      data: { totalPaid: { increment: data.amount }, balance: { decrement: data.amount } },
    })

    await createAuditLog({ userId: user.id, action: "SUPPLIER_PAYMENT", entity: "SupplierPayment", entityId: payment.id, newValues: { amount: data.amount } })

    return payment
  })
}
