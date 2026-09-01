import * as svc from "./notificationService.js"

export async function listNotifications(req, res, next) {
  try {
    const notifications = await svc.listNotifications(req.user.id, req.query)
    res.json({ success: true, data: { notifications } })
  } catch (err) { next(err) }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await svc.markAsRead(req.params.id)
    res.json({ success: true, data: notification })
  } catch (err) { next(err) }
}

export async function markAllAsRead(req, res, next) {
  try {
    const result = await svc.markAllAsRead(req.user.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}
