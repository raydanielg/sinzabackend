import { prisma } from "../../config/prisma.js"
import { generateSku } from "../../utils/generators.js"
import { createAuditLog } from "../../utils/audit.js"

// Products
export async function listProducts(filters = {}) {
  const where = {}
  if (filters.companyId) where.companyId = filters.companyId
  if (filters.categoryId) where.categoryId = filters.categoryId
  if (filters.brandId) where.brandId = filters.brandId
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { variants: { some: { sku: { contains: filters.search, mode: "insensitive" } } } },
    ]
  }

  return prisma.product.findMany({
    where,
    include: { category: true, brand: true, variants: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getProductById(id) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, brand: true, variants: { include: { size: true, color: true } } },
  })
}

export async function createProduct(data, createdBy) {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description || "",
      image: data.image || "",
      categoryId: data.categoryId || null,
      brandId: data.brandId || null,
      companyId: data.companyId || createdBy?.companyId || null,
    },
  })
  await createAuditLog({ userId: createdBy.id, companyId: product.companyId, action: "PRODUCT_CREATED", entity: "Product", entityId: product.id, newValues: { name: product.name } })
  return product
}

export async function updateProduct(id, data, updatedBy) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw { status: 404, message: "Product not found" }
  const updated = await prisma.product.update({ where: { id }, data })
  await createAuditLog({ userId: updatedBy.id, companyId: product.companyId, action: "PRODUCT_UPDATED", entity: "Product", entityId: id, oldValues: { name: product.name }, newValues: data })
  return updated
}

export async function deleteProduct(id) {
  await prisma.product.delete({ where: { id } })
  return { success: true }
}

// Variants
export async function createVariant(productId, data, createdBy) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw { status: 404, message: "Product not found" }

  const size = data.sizeId ? await prisma.size.findUnique({ where: { id: data.sizeId } }) : null
  const color = data.colorId ? await prisma.color.findUnique({ where: { id: data.colorId } }) : null
  const sku = data.sku || generateSku(product.name, color?.name, size?.name)

  const existing = await prisma.productVariant.findUnique({ where: { sku } })
  if (existing) throw { status: 409, message: "SKU already exists" }

  return prisma.productVariant.create({
    data: {
      productId,
      sku,
      barcode: data.barcode || "",
      sizeId: data.sizeId || null,
      colorId: data.colorId || null,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      reorderLevel: data.reorderLevel || 10,
    },
  })
}

export async function updateVariant(variantId, data) {
  return prisma.productVariant.update({ where: { id: variantId }, data })
}

export async function deleteVariant(variantId) {
  await prisma.productVariant.delete({ where: { id: variantId } })
  return { success: true }
}

// Categories
export async function listCategories(companyId) {
  return prisma.category.findMany({
    where: companyId ? { companyId } : {},
    include: { parent: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })
}

export async function createCategory(data, createdBy) {
  return prisma.category.create({
    data: {
      name: data.name,
      parentId: data.parentId || null,
      companyId: data.companyId || createdBy?.companyId || null,
    },
  })
}

export async function updateCategory(id, data) {
  return prisma.category.update({ where: { id }, data })
}

export async function deleteCategory(id) {
  await prisma.category.delete({ where: { id } })
  return { success: true }
}

// Brands
export async function listBrands(companyId) {
  return prisma.brand.findMany({ where: companyId ? { companyId } : {}, orderBy: { name: "asc" } })
}

export async function createBrand(data, createdBy) {
  return prisma.brand.create({ data: { name: data.name, companyId: data.companyId || createdBy?.companyId || null } })
}

export async function updateBrand(id, data) {
  return prisma.brand.update({ where: { id }, data })
}

export async function deleteBrand(id) {
  await prisma.brand.delete({ where: { id } })
  return { success: true }
}

// Sizes
export async function listSizes(companyId) {
  return prisma.size.findMany({ where: companyId ? { companyId } : {}, orderBy: { name: "asc" } })
}

export async function createSize(data, createdBy) {
  return prisma.size.create({ data: { name: data.name, companyId: data.companyId || createdBy?.companyId || null } })
}

export async function deleteSize(id) {
  await prisma.size.delete({ where: { id } })
  return { success: true }
}

// Colors
export async function listColors(companyId) {
  return prisma.color.findMany({ where: companyId ? { companyId } : {}, orderBy: { name: "asc" } })
}

export async function createColor(data, createdBy) {
  return prisma.color.create({ data: { name: data.name, hexCode: data.hexCode || "", companyId: data.companyId || createdBy?.companyId || null } })
}

export async function deleteColor(id) {
  await prisma.color.delete({ where: { id } })
  return { success: true }
}
