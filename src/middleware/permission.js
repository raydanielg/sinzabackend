export function hasPermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" })
    }

    const roles = req.user.roles || []
    if (roles.includes("super_admin")) return next()

    const permissions = req.user.permissions || []
    if (permissions.includes(permission)) return next()

    return res.status(403).json({
      success: false,
      message: `Permission denied: requires '${permission}'`,
    })
  }
}

export function hasAnyPermission(...perms) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" })
    }

    const roles = req.user.roles || []
    if (roles.includes("super_admin")) return next()

    const userPerms = req.user.permissions || []
    const hasOne = perms.some((p) => userPerms.includes(p))
    if (hasOne) return next()

    return res.status(403).json({
      success: false,
      message: `Permission denied: requires one of [${perms.join(", ")}]`,
    })
  }
}
