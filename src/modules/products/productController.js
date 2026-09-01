import * as svc from "./productService.js"
import {
  createProductSchema, updateProductSchema, createVariantSchema, updateVariantSchema,
  createCategorySchema, createBrandSchema, createSizeSchema, createColorSchema,
} from "./productValidation.js"

// Products
export async function listProducts(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.companyId) filters.companyId = req.user.companyId
    const products = await svc.listProducts(filters)
    res.json({ success: true, data: { products } })
  } catch (err) { next(err) }
}

export async function getProduct(req, res, next) {
  try {
    const product = await svc.getProductById(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: "Product not found" })
    res.json({ success: true, data: product })
  } catch (err) { next(err) }
}

export async function createProduct(req, res, next) {
  try {
    const data = createProductSchema.parse(req.body)
    const product = await svc.createProduct(data, req.user)
    res.status(201).json({ success: true, data: product })
  } catch (err) { next(err) }
}

export async function updateProduct(req, res, next) {
  try {
    const data = updateProductSchema.parse(req.body)
    const product = await svc.updateProduct(req.params.id, data, req.user)
    res.json({ success: true, data: product })
  } catch (err) { next(err) }
}

export async function deleteProduct(req, res, next) {
  try {
    const result = await svc.deleteProduct(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// Variants
export async function createVariant(req, res, next) {
  try {
    const data = createVariantSchema.parse(req.body)
    const variant = await svc.createVariant(req.params.id, data, req.user)
    res.status(201).json({ success: true, data: variant })
  } catch (err) { next(err) }
}

export async function updateVariant(req, res, next) {
  try {
    const data = updateVariantSchema.parse(req.body)
    const variant = await svc.updateVariant(req.params.variantId, data)
    res.json({ success: true, data: variant })
  } catch (err) { next(err) }
}

export async function deleteVariant(req, res, next) {
  try {
    const result = await svc.deleteVariant(req.params.variantId)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// Categories
export async function listCategories(req, res, next) {
  try {
    const categories = await svc.listCategories(req.user.companyId)
    res.json({ success: true, data: { categories } })
  } catch (err) { next(err) }
}

export async function createCategory(req, res, next) {
  try {
    const data = createCategorySchema.parse(req.body)
    const category = await svc.createCategory(data, req.user)
    res.status(201).json({ success: true, data: category })
  } catch (err) { next(err) }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await svc.updateCategory(req.params.id, req.body)
    res.json({ success: true, data: category })
  } catch (err) { next(err) }
}

export async function deleteCategory(req, res, next) {
  try {
    const result = await svc.deleteCategory(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// Brands
export async function listBrands(req, res, next) {
  try {
    const brands = await svc.listBrands(req.user.companyId)
    res.json({ success: true, data: { brands } })
  } catch (err) { next(err) }
}

export async function createBrand(req, res, next) {
  try {
    const data = createBrandSchema.parse(req.body)
    const brand = await svc.createBrand(data, req.user)
    res.status(201).json({ success: true, data: brand })
  } catch (err) { next(err) }
}

export async function deleteBrand(req, res, next) {
  try {
    const result = await svc.deleteBrand(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// Sizes
export async function listSizes(req, res, next) {
  try {
    const sizes = await svc.listSizes(req.user.companyId)
    res.json({ success: true, data: { sizes } })
  } catch (err) { next(err) }
}

export async function createSize(req, res, next) {
  try {
    const data = createSizeSchema.parse(req.body)
    const size = await svc.createSize(data, req.user)
    res.status(201).json({ success: true, data: size })
  } catch (err) { next(err) }
}

export async function deleteSize(req, res, next) {
  try {
    const result = await svc.deleteSize(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// Colors
export async function listColors(req, res, next) {
  try {
    const colors = await svc.listColors(req.user.companyId)
    res.json({ success: true, data: { colors } })
  } catch (err) { next(err) }
}

export async function createColor(req, res, next) {
  try {
    const data = createColorSchema.parse(req.body)
    const color = await svc.createColor(data, req.user)
    res.status(201).json({ success: true, data: color })
  } catch (err) { next(err) }
}

export async function deleteColor(req, res, next) {
  try {
    const result = await svc.deleteColor(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}
