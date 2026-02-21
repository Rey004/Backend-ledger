const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenblackListModel = require("../models/blackList.model")

async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1]

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" })
    }

    const isBlackListed = await tokenblackListModel.findOne({ token })

    if (isBlackListed) {
        return res.status(401).json({ message: "Unauthorized: Token is blacklisted" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" })
        }

        req.user = user
        return next()
    }
    catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" })
    }

}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1]
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" })
    }

        const isBlackListed = await tokenblackListModel.findOne({ token })

    if (isBlackListed) {
        return res.status(401).json({ message: "Unauthorized: Token is blacklisted" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+systemUser")

        if (!user || !user.systemUser) {
            return res.status(403).json({ message: "Forbidden: Access is denied" })
        }

        req.user = user
        return next()
    }    catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" })
    }
         
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}