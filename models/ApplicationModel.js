const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
    studentId:{type:mongoose.Types.ObjectId},
    university:{type:String},
    course:{type:String},
    intake:{type:String},
    country:{type:String},
    creator:{type:mongoose.Types.ObjectId},
    steps:{type:Array},
    documents:{type:Array},
});

const Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;