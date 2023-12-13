const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {type:String,unique:true},
    email: {type:String,unique:true},
    image:{type:String},
    role: {type:String},
    isBlocked: {type:Boolean},
    isGoogleUser: {type:Boolean},
    refreshTokens: {type:Array, default:[]}
})

const User = mongoose.model("User", UserSchema);

module.exports = User;