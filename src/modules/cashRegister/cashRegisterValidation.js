import { z } from "zod"

export const openSessionSchema = z.object({
  openingBalance: z.number().min(0),
  branchId: z.string().optional(),
})

export const closeSessionSchema = z.object({
  closingBalance: z.number().min(0),
  notes: z.string().optional(),
})
