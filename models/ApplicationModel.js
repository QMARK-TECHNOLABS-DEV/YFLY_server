const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
    studentId:{type:mongoose.Types.ObjectId,unique:true,required:true},
    university:{type:String},
    course:{type:String},
    intake:{type:String},
    country:{type:String,required:true},
    creator:{type:mongoose.Types.ObjectId,required:true},
    steps:{type:Array, default:[]},
    documents:{type:Array, default:[]},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date, default:Date.now},
});

const Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;