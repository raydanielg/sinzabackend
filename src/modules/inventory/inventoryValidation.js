import { z } from "zod"

export const stockAdjustmentSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int(),
  reason: z.string().min(2),
  note: z.string().optional(),
  branchId: z.string().optional(),
})

export const stockTransferSchema = z.object({
  fromBranchId: z.string(),
  toBranchId: z.string(),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
  notes: z.string().optional(),
})

export const transferStatusSchema = z.object({
  status: z.enum(["approved", "dispatched", "received", "cancelled"]),
})
