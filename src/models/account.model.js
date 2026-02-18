const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"user is required"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE", "FROZEN", "CLOSED"],
            message:"status should be either ACTIVE, FROZEN or CLOSED"
        },
        default:"ACTIVE" 
    },
    currency:{
        type:String,
        required:[true,"currency is required"],
        default:"INR"
    }
},{timestamps:true})

accountSchema.index({user:1, staus:1})

const accountModel = mongoose.model("account", accountSchema)
module.exports = accountModel