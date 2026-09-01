import * as svc from "./settingService.js"

export async function listSettings(req, res, next) {
  try {
    const settings = await svc.listSettings(req.user.companyId)
    const obj = {}
    settings.forEach((s) => { obj[s.key] = s.value })
    res.json({ success: true, data: obj })
  } catch (err) { next(err) }
}

export async function updateSettings(req, res, next) {
  try {
    const settings = await svc.updateSettings(req.user.companyId, req.body)
    res.json({ success: true, data: settings })
  } catch (err) { next(err) }
}
