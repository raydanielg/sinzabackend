import { prisma } from "../../config/prisma.js"
import { generateSaleNumber, generateReturnNo } from "../../utils/generators.js"
import { createAuditLog } from "../../utils/audit.js"

export async function createSale(data, user) {
  const branchId = data.branchId || user.branchId
  if (!branchId) throw { status: 400, message: "Branch ID required" }

  return prisma.$transaction(async (tx) => {
    let subtotal = 0
    const saleItems = []

    for (const item of data.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      })
      if (!variant) throw { status: 400, message: `Variant ${item.variantId} not found` }

      const stock = await tx.branchStock.findUnique({
        where: { branchId_variantId: { branchId, variantId: item.variantId } },
      })
      if (!stock || stock.quantity < item.quantity) {
        throw { status: 400, message: `Insufficient stock for ${variant.product.name} (${variant.sku})` }
      }

      const unitPrice = variant.sellingPrice
      const costPrice = variant.costPrice
      const lineTotal = unitPrice * item.quantity
      subtotal += lineTotal

      saleItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        costPrice,
        total: lineTotal,
      })
    }

    const discount = data.discount || 0
    const total = subtotal - discount

    const paymentTotal = data.payments.reduce((sum, p) => sum + p.amount, 0)
    if (Math.abs(paymentTotal - total) > 1) {
      throw { status: 400, message: `Payment total (${paymentTotal}) does not match sale total (${total})` }
    }

    const company = await tx.company.findFirst()
    const saleNumber = generateSaleNumber(company?.receiptPrefix || "SF")

    const sale = await tx.sale.create({
      data: {
        saleNumber,
        subtotal,
        discount,
        total,
        status: "completed",
        note: data.note || "",
        companyId: user.companyId || company?.id || "",
        branchId,
        cashierId: user.id,
        customerId: data.customerId || null,
        items: { create: saleItems },
        payments: {
          create: data.payments.map((p) => ({
            method: p.method,
            amount: p.amount,
            reference: p.reference || "",
          })),
        },
      },
      include: { items: { include: { variant: { include: { product: true } } } }, payments: true },
    })

    for (const item of saleItems) {
      const stock = await tx.branchStock.findUnique({
        where: { branchId_variantId: { branchId, variantId: item.variantId } },
      })
      const prevQty = stock.quantity
      const newQty = prevQty - item.quantity
      await tx.branchStock.update({ where: { id: stock.id }, data: { quantity: newQty } })
      await tx.stockMovement.create({
        data: {
          branchId, variantId: item.variantId, type: "SALE",
          quantity: -item.quantity, referenceType: "SALE", referenceId: sale.id,
          previousQuantity: prevQty, newQuantity: newQty, createdBy: user.id,
        },
      })
    }

    if (data.customerId) {
      await tx.customer.update({
        where: { id: data.customerId },
        data: { totalPurchases: { increment: total }, loyaltyPoints: { increment: Math.floor(total / 1000) } },
      })
    }

    await createAuditLog({ userId: user.id, companyId: user.companyId, branchId, action: "SALE_CREATED", entity: "Sale", entityId: sale.id, newValues: { saleNumber, total } })

    return sale
  })
}

export async function listSales(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.cashierId) where.cashierId = filters.cashierId
  if (filters.customerId) where.customerId = filters.customerId
  if (filters.status) where.status = filters.status
  if (filters.from || filters.to) {
    where.createdAt = {}
    if (filters.from) where.createdAt.gte = new Date(filters.from)
    if (filters.to) where.createdAt.lte = new Date(filters.to)
  }

  return prisma.sale.findMany({
    where,
    include: {
      items: { include: { variant: { include: { product: true } } } },
      payments: true,
      cashier: true,
      customer: true,
      branch: true,
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit ? parseInt(filters.limit) : 100,
  })
}

export async function getSaleById(id) {
  return prisma.sale.findUnique({
    where: { id },
    include: {
      items: { include: { variant: { include: { product: true, size: true, color: true } } } },
      payments: true,
      cashier: true,
      customer: true,
      branch: true,
      returns: { include: { items: true } },
    },
  })
}

export async function createReturn(data, user) {
  const branchId = user.branchId
  if (!branchId) throw { status: 400, message: "Branch ID required" }

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: data.saleId },
      include: { items: true },
    })
    if (!sale) throw { status: 404, message: "Sale not found" }

    const returnNumber = generateReturnNo()
    let refundAmount = 0
    const returnItems = []

    for (const item of data.items) {
      const saleItem = sale.items.find((si) => si.id === item.saleItemId)
      if (!saleItem) throw { status: 400, message: `Sale item ${item.saleItemId} not found` }
      if (item.quantity > saleItem.quantity) throw { status: 400, message: "Return quantity exceeds sold quantity" }

      const lineRefund = saleItem.unitPrice * item.quantity
      refundAmount += lineRefund

      returnItems.push({
        saleItemId: item.saleItemId,
        variantId: saleItem.variantId,
        quantity: item.quantity,
        unitPrice: saleItem.unitPrice,
        total: lineRefund,
        condition: item.condition,
      })
    }

    const saleReturn = await tx.saleReturn.create({
      data: {
        returnNumber,
        reason: data.reason,
        refundAmount,
        refundMethod: data.refundMethod,
        status: "approved",
        saleId: sale.id,
        branchId,
        customerId: sale.customerId,
        createdById: user.id,
        items: { create: returnItems },
      },
      include: { items: true },
    })

    for (const item of returnItems) {
      const stock = await tx.branchStock.findUnique({
        where: { branchId_variantId: { branchId, variantId: item.variantId } },
      })
      const prevQty = stock?.quantity || 0
      const newQty = prevQty + item.quantity
      if (stock) {
        await tx.branchStock.update({ where: { id: stock.id }, data: { quantity: newQty } })
      } else {
        await tx.branchStock.create({ data: { branchId, variantId: item.variantId, quantity: newQty } })
      }
      await tx.stockMovement.create({
        data: {
          branchId, variantId: item.variantId, type: "RETURN",
          quantity: item.quantity, referenceType: "RETURN", referenceId: saleReturn.id,
          previousQuantity: prevQty, newQuantity: newQty, createdBy: user.id,
        },
      })
    }

    await createAuditLog({ userId: user.id, branchId, action: "SALE_RETURN", entity: "SaleReturn", entityId: saleReturn.id, newValues: { returnNumber, refundAmount } })

    return saleReturn
  })
}

export async function listReturns(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId
  return prisma.saleReturn.findMany({
    where,
    include: { sale: true, items: { include: { variant: { include: { product: true } } } }, createdBy: true },
    orderBy: { createdAt: "desc" },
  })
}
