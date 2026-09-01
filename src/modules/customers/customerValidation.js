import { z } from "zod"

export const createCustomerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  companyId: z.string().optional(),
})

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})
