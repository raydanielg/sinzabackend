import * as svc from "./userService.js"
import { createUserSchema, updateUserSchema, createRoleSchema, updateRoleSchema } from "./userValidation.js"

export async function listUsers(req, res, next) {
  try {
    const filters = { ...req.query }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    if (req.user.companyId) filters.companyId = req.user.companyId
    const users = await svc.listUsers(filters)
    res.json({ success: true, data: { users } })
  } catch (err) { next(err) }
}

export async function getUser(req, res, next) {
  try {
    const user = await svc.getUserById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}

export async function createUser(req, res, next) {
  try {
    const data = createUserSchema.parse(req.body)
    const user = await svc.createUser(data, req.user)
    res.status(201).json({ success: true, data: user })
  } catch (err) { next(err) }
}

export async function updateUser(req, res, next) {
  try {
    const data = updateUserSchema.parse(req.body)
    const user = await svc.updateUser(req.params.id, data, req.user)
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}

export async function deleteUser(req, res, next) {
  try {
    const result = await svc.deleteUser(req.params.id, req.user)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function listRoles(req, res, next) {
  try {
    const roles = await svc.listRoles()
    res.json({ success: true, data: { roles } })
  } catch (err) { next(err) }
}

export async function createRole(req, res, next) {
  try {
    const data = createRoleSchema.parse(req.body)
    const role = await svc.createRole(data, req.user)
    res.status(201).json({ success: true, data: role })
  } catch (err) { next(err) }
}

export async function updateRole(req, res, next) {
  try {
    const data = updateRoleSchema.parse(req.body)
    const role = await svc.updateRole(req.params.id, data, req.user)
    res.json({ success: true, data: role })
  } catch (err) { next(err) }
}

export async function deleteRole(req, res, next) {
  try {
    const result = await svc.deleteRole(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function listPermissions(req, res, next) {
  try {
    const permissions = await svc.listPermissions()
    res.json({ success: true, data: { permissions } })
  } catch (err) { next(err) }
}
