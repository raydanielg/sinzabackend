import { prisma } from "../../config/prisma.js"
import { generateInvoiceNumber } from "../../utils/generators.js"
import { createAuditLog } from "../../utils/audit.js"

export async function createInvoice(data, user) {
  const branchId = data.branchId || user.branchId
  if (!branchId) throw { status: 400, message: "Branch ID required" }

  const company = await prisma.company.findFirst()
  const prefix = company?.invoicePrefix || "INV"
  const invoiceNumber = generateInvoiceNumber(prefix)

  let subtotal = 0
  let totalTax = 0
  const invoiceItems = []

  for (const item of data.items) {
    let unitRate = item.rate
    let description = item.description || ""

    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      })
      if (!variant) throw { status: 400, message: `Variant ${item.variantId} not found` }
      if (!description) description = variant.product.name
      if (item.rateType === "retail") unitRate = variant.sellingPrice
    }

    const lineAmount = unitRate * item.quantity
    let lineTax = 0

    if (item.taxType === "INCL") {
      const netAmount = lineAmount / (1 + item.taxRate / 100)
      lineTax = lineAmount - netAmount
      subtotal += netAmount
    } else {
      lineTax = lineAmount * (item.taxRate / 100)
      subtotal += lineAmount
    }

    totalTax += lineTax

    invoiceItems.push({
      variantId: item.variantId || null,
      description,
      quantity: item.quantity,
      rate: unitRate,
      amount: lineAmount,
      taxRate: item.taxRate,
      taxAmount: lineTax,
      taxType: item.taxType,
      rateType: item.rateType,
    })
  }

  const discountAmount = data.discountAmount || 0
  const discountPercent = data.discountPercent || 0
  const totalBeforeDiscount = subtotal + totalTax
  const calculatedDiscount = discountAmount > 0 ? discountAmount : (totalBeforeDiscount * discountPercent / 100)
  const totalAfterDiscount = totalBeforeDiscount - calculatedDiscount
  const total = totalAfterDiscount
  const partialPayment = data.partialPayment || 0
  const balance = total - partialPayment
  const status = partialPayment > 0 ? "partial" : "draft"

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      paymentTerms: data.paymentTerms || "Due Upon Receipt",
      invoiceDate: new Date(data.invoiceDate),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      memo: data.memo || "",
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
      project: data.project || "",
      saleCirculation: data.saleCirculation || "",
      salePerson: data.salePerson || "",
      stationLocation: data.stationLocation || "",
      partialPayment,
      paymentMethod: data.paymentMethod || "cash",
      paymentNote: data.paymentNote || "",
      subtotal,
      tax: totalTax,
      total,
      discountAmount: calculatedDiscount,
      discountPercent,
      totalAfterDiscount,
      paidAmount: partialPayment,
      balance,
      status,
      attachments: JSON.stringify(data.attachments || []),
      companyId: user.companyId || company?.id || "",
      branchId,
      createdById: user.id,
      customerId: data.customerId || null,
      items: { create: invoiceItems },
    },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      customer: true,
      branch: true,
    },
  })

  await createAuditLog({
    userId: user.id,
    companyId: user.companyId,
    branchId,
    action: "INVOICE_CREATED",
    entity: "Invoice",
    entityId: invoice.id,
    newValues: { invoiceNumber, total, status },
  })

  return invoice
}

export async function listInvoices(filters = {}) {
  const where = {}
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.status) where.status = filters.status
  if (filters.customerId) where.customerId = filters.customerId
  if (filters.search) {
    where.OR = [
      { invoiceNumber: { contains: filters.search, mode: "insensitive" } },
      { customer: { name: { contains: filters.search, mode: "insensitive" } } },
    ]
  }

  return prisma.invoice.findMany({
    where,
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getInvoiceById(id) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      branch: true,
      items: { include: { variant: { include: { product: true } } } },
      createdBy: true,
    },
  })
}

export async function updateInvoice(id, data, user) {
  const existing = await prisma.invoice.findUnique({ where: { id } })
  if (!existing) throw { status: 404, message: "Invoice not found" }

  const updateData = {}
  if (data.customerId !== undefined) updateData.customerId = data.customerId || null
  if (data.paymentTerms) updateData.paymentTerms = data.paymentTerms
  if (data.invoiceDate) updateData.invoiceDate = new Date(data.invoiceDate)
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
  if (data.memo !== undefined) updateData.memo = data.memo
  if (data.deliveryDate !== undefined) updateData.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null
  if (data.project !== undefined) updateData.project = data.project
  if (data.saleCirculation !== undefined) updateData.saleCirculation = data.saleCirculation
  if (data.salePerson !== undefined) updateData.salePerson = data.salePerson
  if (data.stationLocation !== undefined) updateData.stationLocation = data.stationLocation
  if (data.partialPayment !== undefined) updateData.partialPayment = data.partialPayment
  if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod
  if (data.paymentNote !== undefined) updateData.paymentNote = data.paymentNote
  if (data.status) updateData.status = data.status
  if (data.attachments !== undefined) updateData.attachments = JSON.stringify(data.attachments)

  if (data.discountAmount !== undefined) updateData.discountAmount = data.discountAmount
  if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent

  if (data.items) {
    let subtotal = 0
    let totalTax = 0
    const invoiceItems = []

    for (const item of data.items) {
      let unitRate = item.rate
      let description = item.description || ""

      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        })
        if (variant) {
          if (!description) description = variant.product.name
          if (item.rateType === "retail") unitRate = variant.sellingPrice
        }
      }

      const lineAmount = unitRate * item.quantity
      let lineTax = 0

      if (item.taxType === "INCL") {
        const netAmount = lineAmount / (1 + item.taxRate / 100)
        lineTax = lineAmount - netAmount
        subtotal += netAmount
      } else {
        lineTax = lineAmount * (item.taxRate / 100)
        subtotal += lineAmount
      }

      totalTax += lineTax

      invoiceItems.push({
        variantId: item.variantId || null,
        description,
        quantity: item.quantity,
        rate: unitRate,
        amount: lineAmount,
        taxRate: item.taxRate,
        taxAmount: lineTax,
        taxType: item.taxType,
        rateType: item.rateType,
      })
    }

    const totalBeforeDiscount = subtotal + totalTax
    const discountAmount = data.discountAmount || 0
    const discountPercent = data.discountPercent || 0
    const calculatedDiscount = discountAmount > 0 ? discountAmount : (totalBeforeDiscount * discountPercent / 100)
    const totalAfterDiscount = totalBeforeDiscount - calculatedDiscount

    updateData.subtotal = subtotal
    updateData.tax = totalTax
    updateData.total = totalAfterDiscount
    updateData.totalAfterDiscount = totalAfterDiscount
    updateData.balance = totalAfterDiscount - existing.paidAmount

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } })
    updateData.items = { create: invoiceItems }
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      items: { include: { variant: { include: { product: true } } } },
      customer: true,
    },
  })

  await createAuditLog({
    userId: user.id,
    companyId: user.companyId,
    branchId: existing.branchId,
    action: "INVOICE_UPDATED",
    entity: "Invoice",
    entityId: id,
    oldValues: { invoiceNumber: existing.invoiceNumber, status: existing.status },
    newValues: updateData,
  })

  return invoice
}

export async function deleteInvoice(id, user) {
  const existing = await prisma.invoice.findUnique({ where: { id } })
  if (!existing) throw { status: 404, message: "Invoice not found" }

  await prisma.invoice.delete({ where: { id } })

  await createAuditLog({
    userId: user.id,
    companyId: user.companyId,
    branchId: existing.branchId,
    action: "INVOICE_DELETED",
    entity: "Invoice",
    entityId: id,
    oldValues: { invoiceNumber: existing.invoiceNumber },
  })

  return { success: true }
}
