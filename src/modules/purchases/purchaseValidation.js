import { z } from "zod"

export const createPurchaseSchema = z.object({
  supplierId: z.string(),
  branchId: z.string().optional(),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().positive(),
    unitCost: z.number().positive(),
  })).min(1),
  discount: z.number().min(0).optional(),
  note: z.string().optional(),
})

export const receivePurchaseSchema = z.object({
  status: z.enum(["received"]),
})

export const createSupplierSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  tin: z.string().optional(),
  companyId: z.string().optional(),
})

export const updateSupplierSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  tin: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const supplierPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["cash", "mobile_money", "card", "bank"]),
  reference: z.string().optional(),
})
