const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenblackListModel = require("../models/blackList.model")

/**
 * 
 * - user register controller  
 * - POST /api/auth/register
 */
async function userRegister(req, res) {
    const { email, name, password } = req.body

    const isExist = await userModel.findOne({ email }) 

    if(isExist){
        return res.status(422).json({
            message:"User already exist",
            status:"failed"
        })
    }

    const user= await userModel.create({
        email, password, name
    })

    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"3d"})

    res.cookie("token", token)

    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token: token
    })

    await emailService.sendRegistrationEmail(user.email, user.name)
}

/**
 * 
 * - user login controller  
 * - POST /api/auth/login
 */
async function userLogin(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email }).select("+password")

    if(!user){
        return res.status(401).json({
            message:"Email or password is incorrect",
            status:"failed"
        })
    }

        const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(401).json({
            message:"Email or password is incorrect",
            status:"failed"
        })
    }

    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"3d"})

    res.cookie("token", token)

    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token: token
    })
}

async function userLogout(req, res) {
    const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1]

    if (!token) {
        return res.status(400).json({ message: "Unauthorized: No token provided" })
    }
    res.clearCookie("token")

    await tokenblackListModel.create({ token })

    res.status(200).json({
        message: "User logged out successfully"
    })
}

module.exports = {
    userRegister,
    userLogin,
    userLogout
}