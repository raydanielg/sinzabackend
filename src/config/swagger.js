export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Sinza Fashion API",
    version: "1.0.0",
    description: "Multi-branch retail ERP/POS backend for Sinza Fashion.\n\n## Authentication\n\n1. Use the **Login** endpoint to get `accessToken` and `refreshToken`\n2. Click the **Authorize** button above\n3. Paste your `accessToken` (without `Bearer ` prefix)\n4. All secured endpoints will now work",
    contact: {
      name: "Sinza Fashion",
      url: "https://sinzawear-web.vercel.app",
    },
    license: {
      name: "Proprietary",
    },
  },
  servers: [
    {
      url: "https://178-104-240-146.sslip.io/api/v1",
      description: "Production",
    },
    {
      url: "http://localhost:4005/api/v1",
      description: "Local Development",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your accessToken (without 'Bearer ' prefix)",
      },
    },
    schemas: {
      Success: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@sinza.co.tz" },
          password: { type: "string", example: "password123" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              accessToken: { type: "string" },
              refreshToken: { type: "string" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string" },
                },
              },
            },
          },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "john@sinza.co.tz" },
          password: { type: "string", minLength: 6, example: "password123" },
          phone: { type: "string", example: "+255700000000" },
          companyId: { type: "string" },
          branchId: { type: "string" },
        },
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "admin@sinza.co.tz" },
        },
      },
      VerifyOtpRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: { type: "string", format: "email", example: "admin@sinza.co.tz" },
          otp: { type: "string", minLength: 6, maxLength: 6, example: "123456" },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["email", "otp", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@sinza.co.tz" },
          otp: { type: "string", minLength: 6, maxLength: 6, example: "123456" },
          password: { type: "string", minLength: 6, example: "newpassword123" },
        },
      },
      RefreshTokenRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          role: { type: "string" },
          branchId: { type: "string" },
          companyId: { type: "string" },
          isActive: { type: "boolean" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          sku: { type: "string" },
          barcode: { type: "string" },
          price: { type: "number" },
          cost: { type: "number" },
          categoryId: { type: "string" },
          brandId: { type: "string" },
          description: { type: "string" },
          images: { type: "array", items: { type: "string" } },
          isActive: { type: "boolean" },
        },
      },
      Branch: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          code: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          isActive: { type: "boolean" },
        },
      },
      Sale: {
        type: "object",
        properties: {
          id: { type: "string" },
          receiptNo: { type: "string" },
          total: { type: "number" },
          subtotal: { type: "number" },
          discount: { type: "number" },
          tax: { type: "number" },
          paymentMethod: { type: "string", enum: ["cash", "card", "mobile", "credit"] },
          status: { type: "string", enum: ["completed", "pending", "refunded"] },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                quantity: { type: "number" },
                price: { type: "number" },
                total: { type: "number" },
              },
            },
          },
        },
      },
      Customer: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          loyaltyPoints: { type: "number" },
        },
      },
      Expense: {
        type: "object",
        properties: {
          id: { type: "string" },
          amount: { type: "number" },
          description: { type: "string" },
          categoryId: { type: "string" },
          date: { type: "string", format: "date" },
        },
      },
      Purchase: {
        type: "object",
        properties: {
          id: { type: "string" },
          supplierId: { type: "string" },
          total: { type: "number" },
          status: { type: "string", enum: ["pending", "received", "cancelled"] },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                quantity: { type: "number" },
                cost: { type: "number" },
              },
            },
          },
        },
      },
      Inventory: {
        type: "object",
        properties: {
          id: { type: "string" },
          productId: { type: "string" },
          branchId: { type: "string" },
          quantity: { type: "number" },
          minStockLevel: { type: "number" },
        },
      },
      CashRegisterSession: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          branchId: { type: "string" },
          openingBalance: { type: "number" },
          closingBalance: { type: "number" },
          status: { type: "string", enum: ["open", "closed"] },
          openedAt: { type: "string", format: "date-time" },
          closedAt: { type: "string", format: "date-time" },
        },
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          message: { type: "string" },
          type: { type: "string" },
          isRead: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AuditLog: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          action: { type: "string" },
          module: { type: "string" },
          ipAddress: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  tags: [
    { name: "Auth", description: "Authentication & authorization endpoints" },
    { name: "Users", description: "User management and roles" },
    { name: "Branches", description: "Branch management" },
    { name: "Products", description: "Products, variants, categories, brands, sizes" },
    { name: "Inventory", description: "Stock management, adjustments, transfers" },
    { name: "Sales", description: "Sales transactions and returns" },
    { name: "Purchases", description: "Purchases and supplier management" },
    { name: "Customers", description: "Customer management" },
    { name: "Expenses", description: "Expense tracking and categories" },
    { name: "Cash Register", description: "Cash register sessions" },
    { name: "Reports", description: "Business reports and analytics" },
    { name: "Audit Logs", description: "Audit trail logs" },
    { name: "Notifications", description: "User notifications" },
    { name: "Settings", description: "System settings" },
  ],
  paths: {
    // ===== AUTH =====
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        description: "Authenticate user and receive access + refresh tokens",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } },
          },
          401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } },
          },
        },
        responses: {
          201: { description: "User created", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
          400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset OTP",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordRequest" } },
          },
        },
        responses: {
          200: { description: "OTP sent if account exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
        },
      },
    },
    "/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verify OTP code",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/VerifyOtpRequest" } },
          },
        },
        responses: {
          200: { description: "OTP verified", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
          400: { description: "Invalid or expired OTP", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password with OTP",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } },
          },
        },
        responses: {
          200: { description: "Password reset successful", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
        },
      },
    },
    "/auth/refresh-token": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenRequest" } },
          },
        },
        responses: {
          200: { description: "New token pair", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
          401: { description: "Invalid refresh token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ===== USERS =====
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "List of users", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
          403: { description: "Forbidden - requires users.view permission" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create new user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
        },
        responses: {
          201: { description: "User created", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
          403: { description: "Forbidden - requires users.create permission" },
        },
      },
    },
    "/users/roles": {
      get: {
        tags: ["Users"],
        summary: "List all roles",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of roles" } },
      },
      post: {
        tags: ["Users"],
        summary: "Create new role",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, permissions: { type: "array", items: { type: "string" } } } } } } },
        responses: { 201: { description: "Role created" } },
      },
    },
    "/users/permissions": {
      get: {
        tags: ["Users"],
        summary: "List all permissions",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of permissions" } },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User details" }, 404: { description: "User not found" } },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
        responses: { 200: { description: "User updated" } },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User deleted" } },
      },
    },
    "/users/roles/{id}": {
      put: {
        tags: ["Users"],
        summary: "Update role",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "Role updated" } },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete role",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Role deleted" } },
      },
    },

    // ===== BRANCHES =====
    "/branches": {
      get: {
        tags: ["Branches"],
        summary: "List all branches",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of branches", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
      post: {
        tags: ["Branches"],
        summary: "Create new branch",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Branch" } } } },
        responses: { 201: { description: "Branch created" } },
      },
    },
    "/branches/{id}": {
      get: {
        tags: ["Branches"],
        summary: "Get branch by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Branch details" } },
      },
      put: {
        tags: ["Branches"],
        summary: "Update branch",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Branch" } } } },
        responses: { 200: { description: "Branch updated" } },
      },
      delete: {
        tags: ["Branches"],
        summary: "Delete branch",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Branch deleted" } },
      },
    },

    // ===== PRODUCTS =====
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List all products",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "categoryId", in: "query", schema: { type: "string" } },
          { name: "brandId", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "List of products", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
      post: {
        tags: ["Products"],
        summary: "Create new product",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
        responses: { 201: { description: "Product created" } },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Product details" } },
      },
      put: {
        tags: ["Products"],
        summary: "Update product",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
        responses: { 200: { description: "Product updated" } },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Product deleted" } },
      },
    },
    "/products/{id}/variants": {
      post: {
        tags: ["Products"],
        summary: "Create product variant",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 201: { description: "Variant created" } },
      },
    },
    "/products/{id}/variants/{variantId}": {
      put: {
        tags: ["Products"],
        summary: "Update product variant",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "variantId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "Variant updated" } },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product variant",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "variantId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Variant deleted" } },
      },
    },
    "/products/categories/list": {
      get: {
        tags: ["Products"],
        summary: "List product categories",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of categories" } },
      },
    },
    "/products/categories": {
      post: {
        tags: ["Products"],
        summary: "Create product category",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } } },
        responses: { 201: { description: "Category created" } },
      },
    },
    "/products/categories/{id}": {
      put: {
        tags: ["Products"],
        summary: "Update product category",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "Category updated" } },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product category",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Category deleted" } },
      },
    },
    "/products/brands/list": {
      get: {
        tags: ["Products"],
        summary: "List brands",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of brands" } },
      },
    },
    "/products/brands": {
      post: {
        tags: ["Products"],
        summary: "Create brand",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } } },
        responses: { 201: { description: "Brand created" } },
      },
    },
    "/products/brands/{id}": {
      delete: {
        tags: ["Products"],
        summary: "Delete brand",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Brand deleted" } },
      },
    },
    "/products/sizes/list": {
      get: {
        tags: ["Products"],
        summary: "List sizes",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of sizes" } },
      },
    },
    "/products/sizes": {
      post: {
        tags: ["Products"],
        summary: "Create size",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } } },
        responses: { 201: { description: "Size created" } },
      },
    },
    "/products/sizes/{id}": {
      delete: {
        tags: ["Products"],
        summary: "Delete size",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Size deleted" } },
      },
    },

    // ===== INVENTORY =====
    "/inventory": {
      get: {
        tags: ["Inventory"],
        summary: "List stock levels",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "branchId", in: "query", schema: { type: "string" } },
          { name: "productId", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Stock list", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
    },
    "/inventory/low-stock": {
      get: {
        tags: ["Inventory"],
        summary: "List low-stock items",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Low stock items" } },
      },
    },
    "/inventory/movements": {
      get: {
        tags: ["Inventory"],
        summary: "List stock movements",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Stock movements" } },
      },
    },
    "/inventory/transfers": {
      get: {
        tags: ["Inventory"],
        summary: "List stock transfers",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Stock transfers" } },
      },
      post: {
        tags: ["Inventory"],
        summary: "Create stock transfer",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { fromBranchId: { type: "string" }, toBranchId: { type: "string" }, productId: { type: "string" }, quantity: { type: "number" } } } } } },
        responses: { 201: { description: "Transfer created" } },
      },
    },
    "/inventory/adjustments": {
      post: {
        tags: ["Inventory"],
        summary: "Create stock adjustment",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { productId: { type: "string" }, quantity: { type: "number" }, reason: { type: "string" } } } } } },
        responses: { 201: { description: "Adjustment created" } },
      },
    },
    "/inventory/transfers/{id}/status": {
      put: {
        tags: ["Inventory"],
        summary: "Update transfer status",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", enum: ["pending", "approved", "rejected", "completed"] } } } } } },
        responses: { 200: { description: "Transfer status updated" } },
      },
    },

    // ===== SALES =====
    "/sales": {
      get: {
        tags: ["Sales"],
        summary: "List all sales",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "branchId", in: "query", schema: { type: "string" } },
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: { 200: { description: "List of sales", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
      post: {
        tags: ["Sales"],
        summary: "Create new sale (POS transaction)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Sale" } } } },
        responses: { 201: { description: "Sale created", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
    },
    "/sales/returns": {
      get: {
        tags: ["Sales"],
        summary: "List sale returns",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of returns" } },
      },
      post: {
        tags: ["Sales"],
        summary: "Create sale return/refund",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 201: { description: "Return created" } },
      },
    },
    "/sales/{id}": {
      get: {
        tags: ["Sales"],
        summary: "Get sale by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Sale details" } },
      },
    },

    // ===== PURCHASES =====
    "/purchases": {
      get: {
        tags: ["Purchases"],
        summary: "List all purchases",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of purchases", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
      post: {
        tags: ["Purchases"],
        summary: "Create new purchase order",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Purchase" } } } },
        responses: { 201: { description: "Purchase created" } },
      },
    },
    "/purchases/{id}": {
      get: {
        tags: ["Purchases"],
        summary: "Get purchase by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Purchase details" } },
      },
    },
    "/purchases/{id}/receive": {
      put: {
        tags: ["Purchases"],
        summary: "Mark purchase as received",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Purchase received" } },
      },
    },
    "/purchases/suppliers/list": {
      get: {
        tags: ["Purchases"],
        summary: "List all suppliers",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of suppliers" } },
      },
    },
    "/purchases/suppliers": {
      post: {
        tags: ["Purchases"],
        summary: "Create new supplier",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, address: { type: "string" } } } } } },
        responses: { 201: { description: "Supplier created" } },
      },
    },
    "/purchases/suppliers/{id}": {
      put: {
        tags: ["Purchases"],
        summary: "Update supplier",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "Supplier updated" } },
      },
      delete: {
        tags: ["Purchases"],
        summary: "Delete supplier",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Supplier deleted" } },
      },
    },
    "/purchases/suppliers/{supplierId}/payments/{purchaseId}": {
      post: {
        tags: ["Purchases"],
        summary: "Pay supplier for a purchase",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "supplierId", in: "path", required: true, schema: { type: "string" } },
          { name: "purchaseId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { amount: { type: "number" }, method: { type: "string" } } } } } },
        responses: { 200: { description: "Payment recorded" } },
      },
    },

    // ===== CUSTOMERS =====
    "/customers": {
      get: {
        tags: ["Customers"],
        summary: "List all customers",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of customers", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
      post: {
        tags: ["Customers"],
        summary: "Create new customer",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Customer" } } } },
        responses: { 201: { description: "Customer created" } },
      },
    },
    "/customers/{id}": {
      get: {
        tags: ["Customers"],
        summary: "Get customer by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Customer details" } },
      },
      put: {
        tags: ["Customers"],
        summary: "Update customer",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Customer" } } } },
        responses: { 200: { description: "Customer updated" } },
      },
      delete: {
        tags: ["Customers"],
        summary: "Delete customer",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Customer deleted" } },
      },
    },

    // ===== EXPENSES =====
    "/expenses": {
      get: {
        tags: ["Expenses"],
        summary: "List all expenses",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of expenses", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
      post: {
        tags: ["Expenses"],
        summary: "Create new expense",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Expense" } } } },
        responses: { 201: { description: "Expense created" } },
      },
    },
    "/expenses/categories/list": {
      get: {
        tags: ["Expenses"],
        summary: "List expense categories",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of categories" } },
      },
    },
    "/expenses/categories": {
      post: {
        tags: ["Expenses"],
        summary: "Create expense category",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } } },
        responses: { 201: { description: "Category created" } },
      },
    },

    // ===== CASH REGISTER =====
    "/cash-register": {
      get: {
        tags: ["Cash Register"],
        summary: "List cash register sessions",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of sessions", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
    },
    "/cash-register/active": {
      get: {
        tags: ["Cash Register"],
        summary: "Get active cash register session",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Active session" } },
      },
    },
    "/cash-register/open": {
      post: {
        tags: ["Cash Register"],
        summary: "Open cash register session",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { openingBalance: { type: "number", example: 50000 } } } } } },
        responses: { 201: { description: "Session opened", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
    },
    "/cash-register/{id}/close": {
      put: {
        tags: ["Cash Register"],
        summary: "Close cash register session",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { closingBalance: { type: "number", example: 75000 } } } } } },
        responses: { 200: { description: "Session closed" } },
      },
    },

    // ===== REPORTS =====
    "/reports/dashboard": {
      get: {
        tags: ["Reports"],
        summary: "Dashboard summary (KPIs)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Dashboard data" } },
      },
    },
    "/reports/sales": {
      get: {
        tags: ["Reports"],
        summary: "Sales report",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "branchId", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Sales report data" } },
      },
    },
    "/reports/inventory": {
      get: { tags: ["Reports"], summary: "Inventory report", security: [{ bearerAuth: [] }], responses: { 200: { description: "Inventory report" } } },
    },
    "/reports/profit": {
      get: { tags: ["Reports"], summary: "Profit & loss report", security: [{ bearerAuth: [] }], responses: { 200: { description: "P&L report" } } },
    },
    "/reports/expenses": {
      get: { tags: ["Reports"], summary: "Expenses report", security: [{ bearerAuth: [] }], responses: { 200: { description: "Expenses report" } } },
    },
    "/reports/purchases": {
      get: { tags: ["Reports"], summary: "Purchases report", security: [{ bearerAuth: [] }], responses: { 200: { description: "Purchases report" } } },
    },
    "/reports/products": {
      get: { tags: ["Reports"], summary: "Products performance report", security: [{ bearerAuth: [] }], responses: { 200: { description: "Products report" } } },
    },
    "/reports/cashiers": {
      get: { tags: ["Reports"], summary: "Cashiers performance report", security: [{ bearerAuth: [] }], responses: { 200: { description: "Cashiers report" } } },
    },
    "/reports/branches": {
      get: { tags: ["Reports"], summary: "Branches comparison report", security: [{ bearerAuth: [] }], responses: { 200: { description: "Branches report" } } },
    },

    // ===== AUDIT LOGS =====
    "/audit-logs": {
      get: {
        tags: ["Audit Logs"],
        summary: "List audit logs",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "userId", in: "query", schema: { type: "string" } },
          { name: "module", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "List of audit logs", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
    },

    // ===== NOTIFICATIONS =====
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List notifications",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of notifications", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
      },
    },
    "/notifications/{id}/read": {
      put: {
        tags: ["Notifications"],
        summary: "Mark notification as read",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Notification marked as read" } },
      },
    },
    "/notifications/read-all": {
      put: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "All notifications marked as read" } },
      },
    },

    // ===== SETTINGS =====
    "/settings": {
      get: {
        tags: ["Settings"],
        summary: "List system settings",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "System settings" } },
      },
      put: {
        tags: ["Settings"],
        summary: "Update system settings",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "Settings updated" } },
      },
    },
  },
}
