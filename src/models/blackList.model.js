const mongoose = require("mongoose")

const blackListSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required"],
        unique:true
    }
},{timestamps:true})

blackListSchema.index({createdAt:1}, {expireAfterSeconds: 60 * 60 * 24 * 3})

const tokenBlackListModel = mongoose.model("blacklist", blackListSchema)

module.exports = tokenBlackListModel