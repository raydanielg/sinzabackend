import * as svc from "./cashRegisterService.js"
import { openSessionSchema, closeSessionSchema } from "./cashRegisterValidation.js"

export async function openSession(req, res, next) {
  try {
    const data = openSessionSchema.parse(req.body)
    const session = await svc.openSession(data, req.user)
    res.status(201).json({ success: true, data: session })
  } catch (err) { next(err) }
}

export async function closeSession(req, res, next) {
  try {
    const data = closeSessionSchema.parse(req.body)
    const session = await svc.closeSession(req.params.id, data, req.user)
    res.json({ success: true, data: session })
  } catch (err) { next(err) }
}

export async function listSessions(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const sessions = await svc.listSessions(filters)
    res.json({ success: true, data: { sessions } })
  } catch (err) { next(err) }
}

export async function getActiveSession(req, res, next) {
  try {
    const session = await svc.getActiveSession(req.user.id)
    res.json({ success: true, data: session })
  } catch (err) { next(err) }
}
