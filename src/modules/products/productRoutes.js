import { Router } from "express"
import * as ctrl from "./productController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

// Products
router.get("/", hasPermission("products.view"), ctrl.listProducts)
router.get("/:id", hasPermission("products.view"), ctrl.getProduct)
router.post("/", hasPermission("products.create"), ctrl.createProduct)
router.put("/:id", hasPermission("products.update"), ctrl.updateProduct)
router.delete("/:id", hasPermission("products.delete"), ctrl.deleteProduct)

// Variants
router.post("/:id/variants", hasPermission("products.update"), ctrl.createVariant)
router.put("/:id/variants/:variantId", hasPermission("products.update"), ctrl.updateVariant)
router.delete("/:id/variants/:variantId", hasPermission("products.update"), ctrl.deleteVariant)

// Categories
router.get("/categories/list", hasPermission("products.view"), ctrl.listCategories)
router.post("/categories", hasPermission("products.create"), ctrl.createCategory)
router.put("/categories/:id", hasPermission("products.update"), ctrl.updateCategory)
router.delete("/categories/:id", hasPermission("products.delete"), ctrl.deleteCategory)

// Brands
router.get("/brands/list", hasPermission("products.view"), ctrl.listBrands)
router.post("/brands", hasPermission("products.create"), ctrl.createBrand)
router.delete("/brands/:id", hasPermission("products.delete"), ctrl.deleteBrand)

// Sizes
router.get("/sizes/list", hasPermission("products.view"), ctrl.listSizes)
router.post("/sizes", hasPermission("products.create"), ctrl.createSize)
router.delete("/sizes/:id", hasPermission("products.delete"), ctrl.deleteSize)

// Colors
router.get("/colors/list", hasPermission("products.view"), ctrl.listColors)
router.post("/colors", hasPermission("products.create"), ctrl.createColor)
router.delete("/colors/:id", hasPermission("products.delete"), ctrl.deleteColor)

export default router
