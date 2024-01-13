const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name:{type:String,required:true},
    status:{type:String, default:"pending"},
    startDate:{type:Date},
    endDate:{type:Date},
    tasks:{type:[
                    {
                        assignee:{type:mongoose.Types.ObjectId},
                        taskName:{type:String},
                        taskStatus:{type:String, default:"pending"},
                    }
                ],
            default:[]
          },
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;