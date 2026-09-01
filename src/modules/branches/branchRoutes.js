import { Router } from "express"
import * as ctrl from "./branchController.js"
import { authenticate } from "../../middleware/auth.js"
import { hasPermission } from "../../middleware/permission.js"

const router = Router()

router.use(authenticate)

router.get("/", hasPermission("branches.view"), ctrl.listBranches)
router.get("/:id", hasPermission("branches.view"), ctrl.getBranch)
router.post("/", hasPermission("branches.manage"), ctrl.createBranch)
router.put("/:id", hasPermission("branches.manage"), ctrl.updateBranch)
router.delete("/:id", hasPermission("branches.manage"), ctrl.deleteBranch)

export default router
