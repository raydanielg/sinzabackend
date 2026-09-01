import { z } from "zod"

export const createBranchSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  managerId: z.string().optional(),
  openingBalance: z.number().optional(),
  companyId: z.string().optional(),
})

export const updateBranchSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  managerId: z.string().nullable().optional(),
  openingBalance: z.number().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  currency: z.string().optional(),
  taxRate: z.number().optional(),
  receiptPrefix: z.string().optional(),
  invoicePrefix: z.string().optional(),
  lowStockThreshold: z.number().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})
