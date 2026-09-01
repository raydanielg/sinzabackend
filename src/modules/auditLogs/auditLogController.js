import * as svc from "./auditLogService.js"

export async function listAuditLogs(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const logs = await svc.listAuditLogs(filters)
    res.json({ success: true, data: { logs } })
  } catch (err) { next(err) }
}
