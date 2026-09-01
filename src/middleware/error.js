import { ZodError } from "zod"
import { logger } from "../config/logger.js"

export function notFound(req, res) {
  res.status(404).json({ success: false, message: "Route not found" })
}

export function errorHandler(err, req, res, next) {
  logger.error({ err, path: req.path, method: req.method }, "Unhandled error")

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
    })
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry: a record with this value already exists",
    })
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    })
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  })
}
