export function generateReceiptNo(prefix = "SF") {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0")
  return `${prefix}-${y}${m}${d}-${rand}`
}

export function generateTransferNo() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0")
  return `TRF-${y}${m}${d}-${rand}`
}

export function generatePurchaseNo() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0")
  return `PO-${y}${m}${d}-${rand}`
}

export function generateReturnNo() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0")
  return `RET-${y}${m}${d}-${rand}`
}

export function generateSessionNo() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0")
  return `CSH-${y}${m}${d}-${rand}`
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateBranchCode(name) {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5)
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `SF-${prefix || "BR"}${rand}`
}

export function generateSku(productName, color, size) {
  const p = productName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)
  const c = (color || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3)
  const s = (size || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3)
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `${p || "PRD"}-${c || "NA"}-${s || "NA"}-${rand}`
}

export function generateSaleNumber(prefix = "SF") {
  return generateReceiptNo(prefix)
}

export function generateInvoiceNumber(prefix = "INV") {
  const date = new Date()
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const ts = Date.now().toString()
  return `${prefix}/${yy}/${mm}/${ts}`
}
