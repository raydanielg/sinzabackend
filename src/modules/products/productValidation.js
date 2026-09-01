import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  companyId: z.string().optional(),
})

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const createVariantSchema = z.object({
  sku: z.string().optional(),
  barcode: z.string().optional(),
  sizeId: z.string().optional(),
  colorId: z.string().optional(),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  reorderLevel: z.number().optional(),
})

export const updateVariantSchema = z.object({
  sku: z.string().optional(),
  barcode: z.string().optional(),
  sizeId: z.string().nullable().optional(),
  colorId: z.string().nullable().optional(),
  costPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  reorderLevel: z.number().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const createCategorySchema = z.object({
  name: z.string().min(2),
  parentId: z.string().optional(),
  companyId: z.string().optional(),
})

export const createBrandSchema = z.object({
  name: z.string().min(2),
  companyId: z.string().optional(),
})

export const createSizeSchema = z.object({
  name: z.string().min(1),
  companyId: z.string().optional(),
})

export const createColorSchema = z.object({
  name: z.string().min(1),
  hexCode: z.string().optional(),
  companyId: z.string().optional(),
})
