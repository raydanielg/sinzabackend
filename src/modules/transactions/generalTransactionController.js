import * as service from "./generalTransactionService.js"

function camelCaseKey(key) {
  const map = {
    VendorCredits: "vendorCredits",
    SubscriptionSales: "subscriptionSales",
    SalesRefunds: "salesRefunds",
    SalesOrders: "salesOrders",
    GiveLoans: "loans",
    LoanRepayments: "loanRepayments",
    ReceiveLoanRepayments: "loanRepayments",
    FundTransfers: "fundTransfers",
    JournalEntries: "journalEntries",
    CreditSales: "creditSales",
    CreditMemos: "creditMemos",
    OwnersDrawings: "ownersDrawings",
    OwnersDeposits: "ownersDeposits",
    LoanDeposits: "loanDeposits",
  }
  return map[key] || key.toLowerCase()
}

function createHandler(entityName) {
  return async (req, res) => {
    try {
      const data = req.body
      if (req.query.branchId) data.branchId = req.query.branchId
      const result = await service[`create${entityName}`](data, req.user)
      res.json({ success: true, data: result })
    } catch (err) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
}

function listHandler(entityName) {
  return async (req, res) => {
    try {
      const filters = { branchId: req.query.branchId }
      const data = await service[`list${entityName}`](filters)
      res.json({ success: true, data: { [camelCaseKey(entityName)]: data } })
    } catch (err) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
}

export const listVendorCredits = listHandler("VendorCredits")
export const createVendorCredit = createHandler("VendorCredit")

export const listSubscriptionSales = listHandler("SubscriptionSales")
export const createSubscriptionSale = createHandler("SubscriptionSale")

export const listSalesRefunds = listHandler("SalesRefunds")
export const createSalesRefund = createHandler("SalesRefund")

export const listSalesOrders = listHandler("SalesOrders")
export const createSalesOrder = createHandler("SalesOrder")

export const listGiveLoans = listHandler("GiveLoans")
export const createGiveLoan = createHandler("GiveLoan")

export const listLoanRepayments = listHandler("LoanRepayments")
export const createLoanRepayment = createHandler("LoanRepayment")

export const listReceiveLoanRepayments = listHandler("ReceiveLoanRepayments")
export const createReceiveLoanRepayment = createHandler("ReceiveLoanRepayment")

export const listFundTransfers = listHandler("FundTransfers")
export const createFundTransfer = createHandler("FundTransfer")

export const listJournalEntries = listHandler("JournalEntries")
export const createJournalEntry = createHandler("JournalEntry")

export const listCreditSales = listHandler("CreditSales")
export const createCreditSale = createHandler("CreditSale")

export const listCreditMemos = listHandler("CreditMemos")
export const createCreditMemo = createHandler("CreditMemo")

export const listOwnersDrawings = listHandler("OwnersDrawings")
export const createOwnersDrawing = createHandler("OwnersDrawing")

export const listOwnersDeposits = listHandler("OwnersDeposits")
export const createOwnersDeposit = createHandler("OwnersDeposit")

export const listLoanDeposits = listHandler("LoanDeposits")
export const createLoanDeposit = createHandler("LoanDeposit")
