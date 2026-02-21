const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const accountModel = require('../models/account.model')
const emailService = require('../services/email.service')

/**
 * Create a new transaction
 * The 10 step transfer flow
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create pending transaction
 * 6. Create ledger entry for sender with DEBIT type
 * 7. Create ledger entry for receiver with CREDIT type
 * 8. Update transaction status to COMPLETED
 * 9. Commit MongoDB session
 * 10. Send notification emails to sender and receiver
 */

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey} = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message:"FromAccount, ToAccount, Amount, and IdempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "FromAccount or ToAccount not found"
        })
    }

    /**
     * Validate Idempotency Key
     */

    const isTransactionExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionExists) {
        if (isTransactionExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already completed",
                transaction: isTransactionExists
            })
        } 
        if (isTransactionExists.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing",
                transaction: isTransactionExists
            })
        }
        if (isTransactionExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed, please try again",
                transaction: isTransactionExists
            })
        }
        if (isTransactionExists.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed",
                transaction: isTransactionExists
            })
        }
    }

    /**
     * Check account status
     */

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "FromAccount or ToAccount is not active"
        })
    }

    /**
     * Derive sender balance from ledger
     */

    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}, required balance is ${amount}`
        })
    }

    /**
     * Create pending transaction
     */

    const session = await transactionModel.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }], { session })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount: amount,
        transaction: transaction[0]._id,
        type: "DEBIT"
    }], { session })    

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction[0]._id,
        type: "CREDIT"
    }], { session })

    transaction[0].status = "COMPLETED"
    await transaction[0].save({ session })

    await session.commitTransaction()
    session.endSession()

    /**
     * Send notification emails to sender and receiver
     */

    await emailService.sendTransactionEmail(
        req.user.email,
        req.user.name,
        amount,
        fromAccount,
        toAccount
    ) 

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction[0]
    })

}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey} = req.body

    if (!req.user || !req.user._id) {
        return res.status(401).json({
            message: "Unauthorized: User context not found"
        })
    }

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message:"ToAccount, Amount, and IdempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "ToAccount not found"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System account not found for the user"
        })
    }

    const session = await transactionModel.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create([{
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }], { session })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction[0]._id,
        type: "DEBIT"
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction[0]._id,
        type: "CREDIT"
    }], { session })

    transaction[0].status = "COMPLETED"
    await transaction[0].save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction[0] 
    })
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}