const accountModel=require("../models/account.model")
const ledgerModel = require("../models/ledger.model")

async function createAccount(req,res){
    const user= req.user;
    const account = await accountModel.create({
        user:user._id
    })

    res.status(201).json({
        message:"Account created successfully",
        account:account
    })
}

async function getAccounts(req,res){
    const accounts = await accountModel.find({user:req.user._id});

    res.status(200).json({
        message:"Accounts retrieved successfully",
        accounts:accounts
    })
} 

async function getAccountBalance(req, res) {
    const { accountId } = req.params;
    const account = await accountModel.findOne({ _id: accountId, user: req.user._id })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        message: "Account balance retrieved successfully",
        balance: balance
    })
}

module.exports={
    createAccount,
    getAccounts,
    getAccountBalance
}