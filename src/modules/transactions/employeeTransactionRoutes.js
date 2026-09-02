import { Router } from "express"
import * as ctrl from "./employeeTransactionController.js"
import { authenticate } from "../../middleware/auth.js"

const router = Router()

router.use(authenticate)

// Employee Allowances
router.get("/employee-allowance", ctrl.listEmployeeAllowances)
router.post("/employee-allowance", ctrl.createEmployeeAllowance)

// Employee Deductions
router.get("/employee-deduction", ctrl.listEmployeeDeductions)
router.post("/employee-deduction", ctrl.createEmployeeDeduction)

// Employee Loans
router.get("/employee-loan", ctrl.listEmployeeLoans)
router.post("/employee-loan", ctrl.createEmployeeLoan)

// Payroll Liabilities
router.get("/payroll-liability", ctrl.listPayrollLiabilities)
router.post("/payroll-liability", ctrl.createPayrollLiability)

// Mid Month Payrolls
router.get("/mid-month-payroll", ctrl.listMidMonthPayrolls)
router.post("/mid-month-payroll", ctrl.createMidMonthPayroll)

export default router
