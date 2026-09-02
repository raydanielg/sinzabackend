import { Router } from "express"
import * as ctrl from "./generalTransactionController.js"
import { authenticate } from "../../middleware/auth.js"

const router = Router()

router.use(authenticate)

// Vendor Credits
router.get("/vendor-credit", ctrl.listVendorCredits)
router.post("/vendor-credit", ctrl.createVendorCredit)

// Subscription Sales
router.get("/subscription-sale", ctrl.listSubscriptionSales)
router.post("/subscription-sale", ctrl.createSubscriptionSale)

// Sales Refunds
router.get("/sales-refund", ctrl.listSalesRefunds)
router.post("/sales-refund", ctrl.createSalesRefund)

// Sales Orders
router.get("/sales-order", ctrl.listSalesOrders)
router.post("/sales-order", ctrl.createSalesOrder)

// Give Loans
router.get("/give-loan", ctrl.listGiveLoans)
router.post("/give-loan", ctrl.createGiveLoan)

// Loan Repayments
router.get("/loan-repayment", ctrl.listLoanRepayments)
router.post("/loan-repayment", ctrl.createLoanRepayment)

// Receive Loan Repayments
router.get("/receive-loan-repayment", ctrl.listReceiveLoanRepayments)
router.post("/receive-loan-repayment", ctrl.createReceiveLoanRepayment)

// Fund Transfers
router.get("/fund-transfer", ctrl.listFundTransfers)
router.post("/fund-transfer", ctrl.createFundTransfer)

// Journal Entries
router.get("/journal-entry", ctrl.listJournalEntries)
router.post("/journal-entry", ctrl.createJournalEntry)

// Credit Sales
router.get("/credit-sale", ctrl.listCreditSales)
router.post("/credit-sale", ctrl.createCreditSale)

// Credit Memos
router.get("/credit-memo", ctrl.listCreditMemos)
router.post("/credit-memo", ctrl.createCreditMemo)

// Owners Drawings
router.get("/owners-drawing", ctrl.listOwnersDrawings)
router.post("/owners-drawing", ctrl.createOwnersDrawing)

// Owners Deposits
router.get("/owners-deposit", ctrl.listOwnersDeposits)
router.post("/owners-deposit", ctrl.createOwnersDeposit)

// Loan Deposits
router.get("/loan-deposit", ctrl.listLoanDeposits)
router.post("/loan-deposit", ctrl.createLoanDeposit)

export default router
