import { z } from "zod"

export const createSaleSchema = z.object({
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
  payments: z.array(z.object({
    method: z.enum(["cash", "mobile_money", "card", "bank"]),
    amount: z.number().positive(),
    reference: z.string().optional(),
  })).min(1),
  discount: z.number().min(0).optional(),
  customerId: z.string().optional(),
  branchId: z.string().optional(),
  note: z.string().optional(),
})

export const createReturnSchema = z.object({
  saleId: z.string(),
  reason: z.string().min(2),
  refundMethod: z.enum(["cash", "mobile_money", "card", "bank"]).default("cash"),
  items: z.array(z.object({
    saleItemId: z.string(),
    quantity: z.number().int().positive(),
    condition: z.enum(["good", "damaged"]).default("good"),
  })).min(1),
})
