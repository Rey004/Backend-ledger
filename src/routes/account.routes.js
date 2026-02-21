const express=require("express")
const { authMiddleware } = require("../middleware/auth.middleware")
const { createAccount, getAccounts, getAccountBalance } = require("../controllers/account.controller")
const mongoose = require("mongoose")



const router=express.Router()

/**
 * POST /api/accounts/
 * Create a new account
 * Protected route
 */
router.post("/", authMiddleware, createAccount)

/**
 * GET /api/accounts/
 * Get all accounts of the authenticated user
 * Protected route
 */
router.get("/", authMiddleware,getAccounts)

/**
 * GET /api/accounts/balance/:accountId
 * Get balance of a specific account
 */
router.get("/balance/:accountId", authMiddleware, getAccountBalance)

module.exports=router