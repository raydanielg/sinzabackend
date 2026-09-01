import { Router } from "express"
import * as ctrl from "./userController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/", hasPermission("users.view"), ctrl.listUsers)
router.get("/roles", hasPermission("users.view"), ctrl.listRoles)
router.get("/permissions", hasPermission("users.view"), ctrl.listPermissions)
router.get("/:id", hasPermission("users.view"), ctrl.getUser)
router.post("/", hasPermission("users.create"), ctrl.createUser)
router.put("/:id", hasPermission("users.update"), ctrl.updateUser)
router.delete("/:id", hasPermission("users.delete"), ctrl.deleteUser)
router.post("/roles", hasPermission("users.manage"), ctrl.createRole)
router.put("/roles/:id", hasPermission("users.manage"), ctrl.updateRole)
router.delete("/roles/:id", hasPermission("users.manage"), ctrl.deleteRole)

export default router
