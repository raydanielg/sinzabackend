import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  companyId: z.string().optional(),
  branchId: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  branchId: z.string().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  roleIds: z.array(z.string()).optional(),
  password: z.string().min(6).optional(),
})

export const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
})

export const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
})
