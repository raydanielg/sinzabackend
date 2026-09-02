import express from "express"
import helmet from "helmet"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import { config } from "./config/env.js"
import { swaggerSpec } from "./config/swagger.js"
import { apiLimiter } from "./middleware/rateLimit.js"
import { notFound, errorHandler } from "./middleware/error.js"
import { logger } from "./config/logger.js"

// Routes
import authRoutes from "./modules/auth/authRoutes.js"
import userRoutes from "./modules/users/userRoutes.js"
import branchRoutes from "./modules/branches/branchRoutes.js"
import companyRoutes from "./modules/company/companyRoutes.js"
import productRoutes from "./modules/products/productRoutes.js"
import inventoryRoutes from "./modules/inventory/inventoryRoutes.js"
import saleRoutes from "./modules/sales/saleRoutes.js"
import invoiceRoutes from "./modules/invoices/invoiceRoutes.js"
import purchaseRoutes from "./modules/purchases/purchaseRoutes.js"
import customerRoutes from "./modules/customers/customerRoutes.js"
import expenseRoutes from "./modules/expenses/expenseRoutes.js"
import cashRegisterRoutes from "./modules/cashRegister/cashRegisterRoutes.js"
import reportRoutes from "./modules/reports/reportRoutes.js"
import accountingRoutes from "./modules/accounting/accountingRoutes.js"
import auditLogRoutes from "./modules/auditLogs/auditLogRoutes.js"
import notificationRoutes from "./modules/notifications/notificationRoutes.js"
import settingRoutes from "./modules/settings/settingRoutes.js"
import hrRoutes from "./modules/hr/hrRoutes.js"
import employeeTransactionRoutes from "./modules/transactions/employeeTransactionRoutes.js"

const app = express()

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))
app.use(cors({ origin: "*", credentials: false }))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(apiLimiter)

// Swagger
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
}
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions))

// Health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Sinza Fashion API is running", timestamp: new Date().toISOString() })
})

// API routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/branches", branchRoutes)
app.use("/api/v1/company", companyRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/inventory", inventoryRoutes)
app.use("/api/v1/sales", saleRoutes)
app.use("/api/v1/invoices", invoiceRoutes)
app.use("/api/v1/purchases", purchaseRoutes)
app.use("/api/v1/customers", customerRoutes)
app.use("/api/v1/expenses", expenseRoutes)
app.use("/api/v1/cash-register", cashRegisterRoutes)
app.use("/api/v1/reports", reportRoutes)
app.use("/api/v1/accounting", accountingRoutes)
app.use("/api/v1/audit-logs", auditLogRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.use("/api/v1/settings", settingRoutes)
app.use("/api/v1/hr", hrRoutes)
app.use("/api/v1/transactions", employeeTransactionRoutes)

app.use(notFound)
app.use(errorHandler)

export { app }
