import * as svc from "./accountingService.js"

export async function listGroups(req, res, next) {
  try {
    const data = await svc.listGroups(req.user.companyId)
    res.json({ success: true, data: { groups: data } })
  } catch (err) { next(err) }
}

export async function createGroup(req, res, next) {
  try {
    const data = await svc.createGroup(req.body, req.user)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function listAccounts(req, res, next) {
  try {
    const filters = { ...req.query, companyId: req.user.companyId }
    if (req.user.branchId && !req.user.roles.includes("super_admin")) filters.branchId = req.user.branchId
    const data = await svc.listAccounts(filters)
    res.json({ success: true, data: { accounts: data } })
  } catch (err) { next(err) }
}

export async function getAccount(req, res, next) {
  try {
    const data = await svc.getAccount(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: "Account not found" })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function createAccount(req, res, next) {
  try {
    const data = await svc.createAccount(req.body, req.user)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function updateAccount(req, res, next) {
  try {
    const data = await svc.updateAccount(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function deleteAccount(req, res, next) {
  try {
    await svc.deleteAccount(req.params.id)
    res.json({ success: true, message: "Account deleted" })
  } catch (err) { next(err) }
}

export async function bankingOverview(req, res, next) {
  try {
    const branchId = req.query.branchId || (req.user.branchId && !req.user.roles.includes("super_admin") ? req.user.branchId : undefined)
    const data = await svc.getBankingOverview(req.user.companyId, branchId)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
