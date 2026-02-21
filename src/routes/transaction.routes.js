const {Router} = require('express');
const {authMiddleware, authSystemUserMiddleware} = require('../middleware/auth.middleware');
const {createTransaction, createInitialFundsTransaction} = require('../controllers/transaction.controller');

const transactionRouter = Router();

/**
 * POST /api/transactions/
 * Description: Create a new transaction 
 */
transactionRouter.post("/", authMiddleware, createTransaction )

/**
 * POST /api/transactions/system/initial-funds
 * Description: Create initial funds transaction from system account to a user account. This route is protected and can only be accessed by system users.
 */
transactionRouter.post("/system/initial-funds", authSystemUserMiddleware, createInitialFundsTransaction)

module.exports = transactionRouter;