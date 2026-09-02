import { Router } from "express"
import * as ctrl from "./hrController.js"
import { authenticate } from "../../middleware/auth.js"

const router = Router()

router.use(authenticate)

// Departments
router.get("/departments", ctrl.listDepartments)
router.post("/departments", ctrl.createDepartment)
router.put("/departments/:id", ctrl.updateDepartment)
router.delete("/departments/:id", ctrl.deleteDepartment)

// Employees
router.get("/employees", ctrl.listEmployees)
router.get("/employees/:id", ctrl.getEmployee)
router.post("/employees", ctrl.createEmployee)
router.put("/employees/:id", ctrl.updateEmployee)
router.delete("/employees/:id", ctrl.deleteEmployee)

// Attendance
router.get("/attendance", ctrl.listAttendance)
router.post("/attendance", ctrl.createAttendance)

// Payroll
router.get("/payroll", ctrl.listPayroll)
router.post("/payroll", ctrl.createPayroll)
router.patch("/payroll/:id/status", ctrl.updatePayrollStatus)

// Leave Requests
router.get("/leave", ctrl.listLeaveRequests)
router.post("/leave", ctrl.createLeaveRequest)
router.patch("/leave/:id/approve", ctrl.approveLeaveRequest)

export default router
