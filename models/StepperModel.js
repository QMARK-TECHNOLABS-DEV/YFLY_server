const mongoose = require("mongoose");

const StepperSchema = new mongoose.Schema({
    applicationId:{type:mongoose.Types.ObjectId},
    university:{type:String, required:true},
    steps:{type:[
        {   
            _id:{type:Number},
            name:{type:String},
            status:{type:String},
            assignee:{type:mongoose.Types.ObjectId}
        }
    ],
    default:[]},
})

const Stepper = mongoose.model("Stepper",StepperSchema)

module.exports = Stepper;