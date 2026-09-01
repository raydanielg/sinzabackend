import { z } from "zod"

export const createExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  paymentMethod: z.enum(["cash", "mobile_money", "card", "bank"]).default("cash"),
  expenseDate: z.string().optional(),
  categoryId: z.string().optional(),
  branchId: z.string().optional(),
})

export const createExpenseCategorySchema = z.object({
  name: z.string().min(2),
})
