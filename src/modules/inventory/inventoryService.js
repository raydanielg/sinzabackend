import { prisma } from "../../config/prisma.js"
import { generateTransferNo } from "../../utils/generators.js"
import { createAuditLog } from "../../utils/audit.js"

export async function listStock(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.variantId) where.variantId = filters.variantId

  return prisma.branchStock.findMany({
    where,
    include: {
      variant: { include: { product: { include: { category: true } }, size: true, color: true } },
      branch: true,
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function listLowStock(branchId) {
  const where = {}
  if (branchId) where.branchId = branchId

  return prisma.branchStock.findMany({
    where: { ...where, quantity: { lte: prisma.branchStock.fields.reorderLevel } },
    include: {
      variant: { include: { product: true, size: true, color: true } },
      branch: true,
    },
  })
}

export async function listMovements(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.variantId) where.variantId = filters.variantId
  if (filters.type) where.type = filters.type

  return prisma.stockMovement.findMany({
    where,
    include: { variant: { include: { product: true } }, branch: true },
    orderBy: { createdAt: "desc" },
    take: filters.limit ? parseInt(filters.limit) : 100,
  })
}

export async function createAdjustment(data, user) {
  const branchId = data.branchId || user.branchId
  if (!branchId) throw { status: 400, message: "Branch ID required" }

  return prisma.$transaction(async (tx) => {
    const stock = await tx.branchStock.findUnique({
      where: { branchId_variantId: { branchId, variantId: data.variantId } },
    })

    const prevQty = stock?.quantity || 0
    const newQty = prevQty + data.quantity

    if (newQty < 0) throw { status: 400, message: "Adjustment would result in negative stock" }

    if (stock) {
      await tx.branchStock.update({
        where: { id: stock.id },
        data: { quantity: newQty },
      })
    } else {
      await tx.branchStock.create({
        data: { branchId, variantId: data.variantId, quantity: newQty },
      })
    }

    const movement = await tx.stockMovement.create({
      data: {
        branchId,
        variantId: data.variantId,
        type: "ADJUSTMENT",
        quantity: data.quantity,
        referenceType: "ADJUSTMENT",
        previousQuantity: prevQty,
        newQuantity: newQty,
        note: data.reason + (data.note ? `: ${data.note}` : ""),
        createdBy: user.id,
      },
    })

    await tx.stockAdjustment.create({
      data: {
        branchId,
        variantId: data.variantId,
        quantity: data.quantity,
        reason: data.reason,
        note: data.note || "",
        userId: user.id,
      },
    })

    await createAuditLog({ userId: user.id, branchId, action: "STOCK_ADJUSTMENT", entity: "BranchStock", entityId: data.variantId, oldValues: { quantity: prevQty }, newValues: { quantity: newQty } })

    return movement
  })
}

export async function createTransfer(data, user) {
  if (data.fromBranchId === data.toBranchId) throw { status: 400, message: "Cannot transfer to same branch" }

  const transferNo = generateTransferNo()
  const companyId = user.companyId

  return prisma.$transaction(async (tx) => {
    for (const item of data.items) {
      const stock = await tx.branchStock.findUnique({
        where: { branchId_variantId: { branchId: data.fromBranchId, variantId: item.variantId } },
      })
      if (!stock || stock.quantity < item.quantity) {
        throw { status: 400, message: `Insufficient stock for variant ${item.variantId}` }
      }
    }

    const transfer = await tx.stockTransfer.create({
      data: {
        transferNo,
        companyId,
        fromBranchId: data.fromBranchId,
        toBranchId: data.toBranchId,
        requestedById: user.id,
        notes: data.notes || "",
        status: "requested",
        items: {
          create: data.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    })

    await createAuditLog({ userId: user.id, companyId, action: "TRANSFER_CREATED", entity: "StockTransfer", entityId: transfer.id, newValues: { transferNo } })

    return transfer
  })
}

export async function updateTransferStatus(id, status, user) {
  const transfer = await prisma.stockTransfer.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!transfer) throw { status: 404, message: "Transfer not found" }

  const flow = ["requested", "approved", "dispatched", "received", "cancelled"]
  const currentIdx = flow.indexOf(transfer.status)
  const newIdx = flow.indexOf(status)

  if (currentIdx === -1 || newIdx === -1) throw { status: 400, message: "Invalid status" }
  if (status === "cancelled" && transfer.status === "received") throw { status: 400, message: "Cannot cancel received transfer" }

  return prisma.$transaction(async (tx) => {
    const updateData = { status }

    if (status === "approved") {
      updateData.approvedById = user.id
    } else if (status === "dispatched") {
      updateData.approvedById = transfer.approvedById || user.id
      for (const item of transfer.items) {
        const stock = await tx.branchStock.findUnique({
          where: { branchId_variantId: { branchId: transfer.fromBranchId, variantId: item.variantId } },
        })
        if (!stock || stock.quantity < item.quantity) {
          throw { status: 400, message: `Insufficient stock for variant ${item.variantId}` }
        }
        const prevQty = stock.quantity
        const newQty = prevQty - item.quantity
        await tx.branchStock.update({ where: { id: stock.id }, data: { quantity: newQty } })
        await tx.stockMovement.create({
          data: {
            branchId: transfer.fromBranchId, variantId: item.variantId, type: "TRANSFER_OUT",
            quantity: -item.quantity, referenceType: "TRANSFER", referenceId: transfer.id,
            previousQuantity: prevQty, newQuantity: newQty, createdBy: user.id,
          },
        })
      }
    } else if (status === "received") {
      updateData.receivedById = user.id
      for (const item of transfer.items) {
        const stock = await tx.branchStock.findUnique({
          where: { branchId_variantId: { branchId: transfer.toBranchId, variantId: item.variantId } },
        })
        const prevQty = stock?.quantity || 0
        const newQty = prevQty + item.quantity
        if (stock) {
          await tx.branchStock.update({ where: { id: stock.id }, data: { quantity: newQty } })
        } else {
          await tx.branchStock.create({ data: { branchId: transfer.toBranchId, variantId: item.variantId, quantity: newQty } })
        }
        await tx.stockMovement.create({
          data: {
            branchId: transfer.toBranchId, variantId: item.variantId, type: "TRANSFER_IN",
            quantity: item.quantity, referenceType: "TRANSFER", referenceId: transfer.id,
            previousQuantity: prevQty, newQuantity: newQty, createdBy: user.id,
          },
        })
      }
    }

    return tx.stockTransfer.update({ where: { id }, data: updateData })
  })
}

export async function listTransfers(filters = {}) {
  const where = {}
  if (filters.companyId) where.companyId = filters.companyId
  if (filters.status) where.status = filters.status
  if (filters.branchId) {
    where.OR = [{ fromBranchId: filters.branchId }, { toBranchId: filters.branchId }]
  }

  return prisma.stockTransfer.findMany({
    where,
    include: {
      fromBranch: true, toBranch: true, requestedBy: true, approvedBy: true, receivedBy: true,
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })
}
