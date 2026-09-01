import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const PERMISSIONS = [
  { name: "products.view", module: "products", description: "View products" },
  { name: "products.create", module: "products", description: "Create products" },
  { name: "products.update", module: "products", description: "Update products" },
  { name: "products.delete", module: "products", description: "Delete products" },
  { name: "sales.view", module: "sales", description: "View sales" },
  { name: "sales.create", module: "sales", description: "Create sales" },
  { name: "sales.cancel", module: "sales", description: "Cancel sales" },
  { name: "sales.refund", module: "sales", description: "Process refunds/returns" },
  { name: "inventory.view", module: "inventory", description: "View inventory" },
  { name: "inventory.adjust", module: "inventory", description: "Adjust stock" },
  { name: "inventory.transfer", module: "inventory", description: "Transfer stock" },
  { name: "purchases.view", module: "purchases", description: "View purchases" },
  { name: "purchases.create", module: "purchases", description: "Create purchases" },
  { name: "purchases.update", module: "purchases", description: "Update purchases" },
  { name: "purchases.delete", module: "purchases", description: "Delete purchases" },
  { name: "customers.view", module: "customers", description: "View customers" },
  { name: "customers.create", module: "customers", description: "Create customers" },
  { name: "customers.update", module: "customers", description: "Update customers" },
  { name: "customers.delete", module: "customers", description: "Delete customers" },
  { name: "expenses.view", module: "expenses", description: "View expenses" },
  { name: "expenses.create", module: "expenses", description: "Create expenses" },
  { name: "reports.view", module: "reports", description: "View reports" },
  { name: "users.view", module: "users", description: "View users" },
  { name: "users.create", module: "users", description: "Create users" },
  { name: "users.update", module: "users", description: "Update users" },
  { name: "users.delete", module: "users", description: "Delete users" },
  { name: "users.manage", module: "users", description: "Manage roles and permissions" },
  { name: "branches.view", module: "branches", description: "View branches" },
  { name: "branches.manage", module: "branches", description: "Manage branches" },
  { name: "company.manage", module: "company", description: "Manage company" },
  { name: "settings.manage", module: "settings", description: "Manage settings" },
  { name: "audit.view", module: "audit", description: "View audit logs" },
]

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "32", "34", "36", "38"]
const COLORS = [
  { name: "Black", hexCode: "#000000" },
  { name: "White", hexCode: "#FFFFFF" },
  { name: "Red", hexCode: "#FF0000" },
  { name: "Blue", hexCode: "#0000FF" },
  { name: "Green", hexCode: "#008000" },
  { name: "Yellow", hexCode: "#FFFF00" },
  { name: "Brown", hexCode: "#A52A2A" },
  { name: "Grey", hexCode: "#808080" },
  { name: "Navy", hexCode: "#000080" },
  { name: "Pink", hexCode: "#FFC0CB" },
]

const EXPENSE_CATEGORIES = ["RENT", "SALARY", "TRANSPORT", "ELECTRICITY", "WATER", "INTERNET", "MARKETING", "REPAIR", "PACKAGING", "OTHER"]

async function main() {
  console.log("Seeding Sinza Fashion database...")

  // Company
  const company = await prisma.company.upsert({
    where: { code: "SF" },
    update: {},
    create: {
      name: "Sinza Fashion",
      code: "SF",
      phone: "+255 700 000 000",
      email: "info@sinza.co.tz",
      address: "Dar es Salaam, Tanzania",
      currency: "TZS",
      taxRate: 0,
      receiptPrefix: "SF",
      invoicePrefix: "INV",
      lowStockThreshold: 10,
    },
  })
  console.log(`Company: ${company.name}`)

  // Permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    })
  }
  console.log(`Created ${PERMISSIONS.length} permissions`)

  // Roles
  const allPerms = await prisma.permission.findMany()

  const superAdminRole = await prisma.role.upsert({
    where: { name: "super_admin" },
    update: {},
    create: { name: "super_admin", description: "Full system access", isSystem: true },
  })

  const managerRole = await prisma.role.upsert({
    where: { name: "manager" },
    update: {},
    create: { name: "manager", description: "Branch manager", isSystem: true },
  })

  const cashierRole = await prisma.role.upsert({
    where: { name: "cashier" },
    update: {},
    create: { name: "cashier", description: "POS cashier", isSystem: true },
  })

  const storekeeperRole = await prisma.role.upsert({
    where: { name: "storekeeper" },
    update: {},
    create: { name: "storekeeper", description: "Inventory manager", isSystem: true },
  })

  const accountantRole = await prisma.role.upsert({
    where: { name: "accountant" },
    update: {},
    create: { name: "accountant", description: "Finance and expenses", isSystem: true },
  })

  // Assign all permissions to super_admin
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    })
  }

  // Manager permissions
  const managerPerms = allPerms.filter((p) =>
    ["products.view", "products.create", "products.update", "sales.view", "sales.create", "sales.cancel", "sales.refund",
     "inventory.view", "inventory.adjust", "inventory.transfer", "purchases.view", "purchases.create", "purchases.update",
     "customers.view", "customers.create", "customers.update", "expenses.view", "expenses.create", "reports.view",
     "users.view", "branches.view"].includes(p.name)
  )
  for (const perm of managerPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: managerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: managerRole.id, permissionId: perm.id },
    })
  }

  // Cashier permissions
  const cashierPerms = allPerms.filter((p) =>
    ["products.view", "sales.view", "sales.create", "sales.cancel", "customers.view", "customers.create", "customers.update", "inventory.view"].includes(p.name)
  )
  for (const perm of cashierPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: cashierRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: cashierRole.id, permissionId: perm.id },
    })
  }

  // Storekeeper permissions
  const storekeeperPerms = allPerms.filter((p) =>
    ["products.view", "products.create", "products.update", "inventory.view", "inventory.adjust", "inventory.transfer", "purchases.view", "purchases.create", "purchases.update", "reports.view"].includes(p.name)
  )
  for (const perm of storekeeperPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: storekeeperRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: storekeeperRole.id, permissionId: perm.id },
    })
  }

  // Accountant permissions
  const accountantPerms = allPerms.filter((p) =>
    ["expenses.view", "expenses.create", "reports.view", "purchases.view", "sales.view"].includes(p.name)
  )
  for (const perm of accountantPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: accountantRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: accountantRole.id, permissionId: perm.id },
    })
  }

  // Admin user
  const hashedPassword = await bcrypt.hash("admin12345", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@sinza.co.tz" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@sinza.co.tz",
      password: hashedPassword,
      phone: "+255 700 000 001",
      companyId: company.id,
      isEmailVerified: true,
    },
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: superAdminRole.id },
  })
  console.log(`Admin user: ${admin.email} / admin12345`)

  // Branches
  const sinza = await prisma.branch.upsert({
    where: { code: "SF-SINZA" },
    update: {},
    create: { name: "Sinza", code: "SF-SINZA", location: "Sinza, Dar es Salaam", phone: "+255 700 000 010", companyId: company.id, openingBalance: 500000 },
  })
  const kariakoo = await prisma.branch.upsert({
    where: { code: "SF-KARIO" },
    update: {},
    create: { name: "Kariakoo", code: "SF-KARIO", location: "Kariakoo, Dar es Salaam", phone: "+255 700 000 011", companyId: company.id, openingBalance: 300000 },
  })
  const mwanza = await prisma.branch.upsert({
    where: { code: "SF-MWANZA" },
    update: {},
    create: { name: "Mwanza", code: "SF-MWANZA", location: "Mwanza City", phone: "+255 700 000 012", companyId: company.id, openingBalance: 200000 },
  })
  console.log(`Created 3 branches: Sinza, Kariakoo, Mwanza`)

  // Sizes
  for (const size of SIZES) {
    await prisma.size.upsert({
      where: { name_companyId: { name: size, companyId: company.id } },
      update: {},
      create: { name: size, companyId: company.id },
    })
  }
  console.log(`Created ${SIZES.length} sizes`)

  // Colors
  for (const color of COLORS) {
    await prisma.color.upsert({
      where: { name_companyId: { name: color.name, companyId: company.id } },
      update: {},
      create: { name: color.name, hexCode: color.hexCode, companyId: company.id },
    })
  }
  console.log(`Created ${COLORS.length} colors`)

  // Categories
  const mensCategory = await prisma.category.upsert({
    where: { id: "cat-mens" },
    update: {},
    create: { name: "Men's Wear", companyId: company.id },
  })
  const womensCategory = await prisma.category.upsert({
    where: { id: "cat-womens" },
    update: {},
    create: { name: "Women's Wear", companyId: company.id },
  })
  const kidsCategory = await prisma.category.upsert({
    where: { id: "cat-kids" },
    update: {},
    create: { name: "Kids Wear", companyId: company.id },
  })
  const accessoriesCategory = await prisma.category.upsert({
    where: { id: "cat-accessories" },
    update: {},
    create: { name: "Accessories", companyId: company.id },
  })

  // Brands
  const localBrand = await prisma.brand.upsert({
    where: { id: "brand-local" },
    update: {},
    create: { name: "Sinza Original", companyId: company.id },
  })
  const nikeBrand = await prisma.brand.upsert({
    where: { id: "brand-nike" },
    update: {},
    create: { name: "Nike", companyId: company.id },
  })

  // Products with variants
  const black = await prisma.color.findFirst({ where: { name: "Black", companyId: company.id } })
  const white = await prisma.color.findFirst({ where: { name: "White", companyId: company.id } })
  const sizeS = await prisma.size.findFirst({ where: { name: "S", companyId: company.id } })
  const sizeM = await prisma.size.findFirst({ where: { name: "M", companyId: company.id } })
  const sizeL = await prisma.size.findFirst({ where: { name: "L", companyId: company.id } })

  const tshirt = await prisma.product.upsert({
    where: { id: "prod-tshirt" },
    update: {},
    create: { name: "Classic T-Shirt", description: "Premium cotton t-shirt", companyId: company.id, categoryId: mensCategory.id, brandId: localBrand.id },
  })

  const variants = [
    { sku: "TSH-BLK-S-001", colorId: black?.id, sizeId: sizeS?.id, costPrice: 8000, sellingPrice: 15000 },
    { sku: "TSH-BLK-M-002", colorId: black?.id, sizeId: sizeM?.id, costPrice: 8000, sellingPrice: 15000 },
    { sku: "TSH-BLK-L-003", colorId: black?.id, sizeId: sizeL?.id, costPrice: 8000, sellingPrice: 15000 },
    { sku: "TSH-WHT-S-004", colorId: white?.id, sizeId: sizeS?.id, costPrice: 8000, sellingPrice: 15000 },
    { sku: "TSH-WHT-M-005", colorId: white?.id, sizeId: sizeM?.id, costPrice: 8000, sellingPrice: 15000 },
    { sku: "TSH-WHT-L-006", colorId: white?.id, sizeId: sizeL?.id, costPrice: 8000, sellingPrice: 15000 },
  ]

  for (const v of variants) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { productId: tshirt.id, ...v, reorderLevel: 10 },
    })
  }

  // Stock for all branches
  for (const v of variants) {
    const variant = await prisma.productVariant.findUnique({ where: { sku: v.sku } })
    if (variant) {
      await prisma.branchStock.upsert({
        where: { branchId_variantId: { branchId: sinza.id, variantId: variant.id } },
        update: {},
        create: { branchId: sinza.id, variantId: variant.id, quantity: 20, reorderLevel: 10 },
      })
      await prisma.branchStock.upsert({
        where: { branchId_variantId: { branchId: kariakoo.id, variantId: variant.id } },
        update: {},
        create: { branchId: kariakoo.id, variantId: variant.id, quantity: 15, reorderLevel: 10 },
      })
      await prisma.branchStock.upsert({
        where: { branchId_variantId: { branchId: mwanza.id, variantId: variant.id } },
        update: {},
        create: { branchId: mwanza.id, variantId: variant.id, quantity: 5, reorderLevel: 10 },
      })
    }
  }

  // Expense categories
  for (const cat of EXPENSE_CATEGORIES) {
    const existing = await prisma.expenseCategory.findFirst({ where: { name: cat } })
    if (!existing) {
      await prisma.expenseCategory.create({ data: { name: cat } })
    }
  }
  console.log(`Created ${EXPENSE_CATEGORIES.length} expense categories`)

  // Supplier
  const supplier = await prisma.supplier.upsert({
    where: { id: "supplier-1" },
    update: {},
    create: { name: "Dar Textile Ltd", phone: "+255 700 000 100", email: "sales@dartextile.co.tz", address: "Kariakoo, Dar es Salaam", tin: "123-456-789", companyId: company.id },
  })
  console.log(`Created supplier: ${supplier.name}`)

  console.log("\nSeed completed successfully!")
  console.log("Login: admin@sinza.co.tz / admin12345")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
