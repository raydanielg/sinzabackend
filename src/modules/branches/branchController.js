import * as svc from "./branchService.js"
import { createBranchSchema, updateBranchSchema, updateCompanySchema } from "./branchValidation.js"

export async function listBranches(req, res, next) {
  try {
    const filters = {}
    if (req.user.companyId) filters.companyId = req.user.companyId
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.id = req.user.branchId
    const branches = await svc.listBranches(filters)
    res.json({ success: true, data: { branches } })
  } catch (err) { next(err) }
}

export async function getBranch(req, res, next) {
  try {
    const branch = await svc.getBranchById(req.params.id)
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" })
    res.json({ success: true, data: branch })
  } catch (err) { next(err) }
}

export async function createBranch(req, res, next) {
  try {
    const data = createBranchSchema.parse(req.body)
    const branch = await svc.createBranch(data, req.user)
    res.status(201).json({ success: true, data: branch })
  } catch (err) { next(err) }
}

export async function updateBranch(req, res, next) {
  try {
    const data = updateBranchSchema.parse(req.body)
    const branch = await svc.updateBranch(req.params.id, data, req.user)
    res.json({ success: true, data: branch })
  } catch (err) { next(err) }
}

export async function deleteBranch(req, res, next) {
  try {
    const result = await svc.deleteBranch(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function getCompany(req, res, next) {
  try {
    const company = await svc.getCompany(req.user.companyId)
    if (!company) return res.status(404).json({ success: false, message: "Company not found" })
    res.json({ success: true, data: company })
  } catch (err) { next(err) }
}

export async function updateCompany(req, res, next) {
  try {
    const data = updateCompanySchema.parse(req.body)
    const company = await svc.updateCompany(req.user.companyId, data, req.user)
    res.json({ success: true, data: company })
  } catch (err) { next(err) }
}
