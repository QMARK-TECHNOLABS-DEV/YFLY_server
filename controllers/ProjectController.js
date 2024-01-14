const Employee = require("../models/EmployeeModel");
const Project = require("../models/ProjectModel");
const ObjectId = require("mongoose").Types.ObjectId;
const projectCtrl = {}

// Create project
projectCtrl.CreateProject = async(req,res)=>{
    const {name,startDate,
    endDate,tasks} = req.body;

    console.log(name,startDate,
        endDate,tasks)

    let tasksArray = tasks?.map((task)=>{
        return (
            {
                ...task,
                assignee: new ObjectId(task.assignee)
            }
        )
    })

    const schemaObject = {
        name,
        startDate,
        endDate,
        tasks:tasksArray,
    }

    try {
        const newDoc = new Project(schemaObject);

        const savedDoc = await newDoc.save();
        
        tasks?.forEach(async(task)=>{
            return(
                await Employee.findByIdAndUpdate(task.assignee,{
                    $push:{currentProjects: savedDoc._id}
                })
            )
        })

        res.status(200).json(savedDoc);
        
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"})
    }
    
}

// Get all projects
projectCtrl.GetAllProjects = async(req,res)=>{

    // Paginators
    const page = req.query.page;
    const entries = req.query.entries;

    
    try {

        const allProjects = await Project.aggregate([
            {
                $unwind:"$tasks"
            },
            {
                $lookup:{
                    from:"employees",
                    localField:"tasks.assignee",
                    foreignField:"_id",
                    as:"assigneeDetails"
                },
            },
            {
                $unwind:"$assigneeDetails"
            },
            {
                $set:{
                    'tasks.assigneeName':"$assigneeDetails.name"
                }
            },
            {
                $group:{
                    _id:'$_id',
                    name:{$first:"$name"},
                    status:{$first:"$status"},
                    startDate:{$first:"$startDate"},
                    endDate:{$first:"$endDate"},
                    tasks:{$push:"$tasks"}
                }
            },
            {
                $sort:{_id:1}
            }
            

        ])
        
        let result;
    
            if(page){
                if(entries){
                    result = allProjects.slice(((page-1)*entries),(page*entries))
                }else{
                    result = allProjects.slice(((page-1)*10),(page*10))
                }
            }else{
                result = allProjects;
            }
    
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"});
    }
}

// Get a project;
projectCtrl.GetProject = async(req,res)=>{
    const projectId = req.params.id;

    if(!(typeof projectId === 'string' || ObjectId.isValid(projectId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }

    try {
        const projectArray = await Project.aggregate([
            {$match:{_id:new ObjectId(projectId)}},
            {
                $unwind:"$tasks"
            },
            {
                $lookup:{
                    from:"employees",
                    localField:"tasks.assignee",
                    foreignField:"_id",
                    as:"assigneeDetails"
                }
            },
            {
                $unwind:"$assigneeDetails"
            },
            {
                $set:{
                    'tasks.assigneeName':"$assigneeDetails.name"
                }
            },
            {
                $group:{
                    _id:"$_id",
                    name:{$first:"$name"},
                    status:{$first:"$status"},
                    startDate:{$first:"$startDate"},
                    endDate:{$first:"$endDate"},
                    tasks:{$push:"$tasks"}
                }
            }
        ])

        const result = projectArray[0]

        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"})
    }

}

// Get a task of a project
projectCtrl.GetATaskOfAProject = async(req,res)=>{
    const projectId = req.params.id;
    const taskId = req.params.taskid;

    if(!(typeof projectId === 'string' || ObjectId.isValid(projectId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }

    try {

        const projectArray = await Project.aggregate([
            {
                $match: { _id: new ObjectId(projectId) }
            },
            {
                $unwind: "$tasks"
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "tasks.assignee",
                    foreignField: "_id",
                    as: "assigneeDetails"
                }
            },
            {
                $unwind: "$assigneeDetails"
            },
            {
                $set: {
                    'tasks.assigneeName': "$assigneeDetails.name"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    status: { $first: "$status" },
                    startDate: { $first: "$startDate" },
                    endDate: { $first: "$endDate" },
                    tasks: { $push: "$tasks" }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    status: 1,
                    startDate: 1,
                    endDate: 1,
                    tasks: {
                        $filter: {
                            input: "$tasks",
                            as: "task",
                            cond: { $eq: ["$$task._id", new ObjectId(taskId)] }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "comments", 
                    localField: "tasks.comments",
                    foreignField: "_id",
                    as: "commentsDetails"
                }
            }
            
            
        ]);
        


        const result = projectArray[0]

        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"})
    }

}

// Update Status;
projectCtrl.UpdateStatus = async(req,res)=>{
    const {projectId, taskId, status } = req.body;

    if(!(typeof projectId === 'string' || ObjectId.isValid(projectId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }

    try {
        const project = await Project.findById(projectId);

        if(!project) return res.status(404).json({msg:"Project doesn't exist"})

        let updatedDoc = await Project.findOneAndUpdate({_id: new ObjectId(projectId), 
            'tasks':{$elemMatch:{_id: new ObjectId(taskId)}}},
            {$set:{'tasks.$.taskStatus':status}}, {new:true}
            );

        let isOngoing = updatedDoc.tasks.some((task)=>{
            return task.taskStatus === "ongoing"
        })       
        
        if(isOngoing){
            updatedDoc = await Project.findByIdAndUpdate(projectId,
                {$set:{status:"ongoing"}}, {new:true}
                )
        }else{
            let isCompleted = updatedDoc.tasks.every((task)=>{
                return task.taskStatus === "completed"
            })
            
            if(isCompleted){
                updatedDoc = await Project.findByIdAndUpdate(projectId,
                    {$set:{status:"completed"}}, {new:true}
                    )
            };

        }

        //If Status eq completed Remove the project id from employee's currentProjects array
        // else if status eq pending add the project id to employee's currentProjects cause it is Rework from admin
        const docWithSingleTask = await Project.findOne({_id:new ObjectId(projectId), "tasks._id":taskId},
        {"tasks.$":1}
        );

        console.log(docWithSingleTask)

        const employeeId = docWithSingleTask.tasks[0].assignee;
        const employee = await Employee.findById(employeeId)

        if(status === "completed"){
            await Employee.findByIdAndUpdate(employeeId,{
                $pull:{currentProjects:projectId}
            })
        }
        else if(status === "pending"){
            const idAlreadyExists = employee.currentProjects.includes(projectId);

            if(!idAlreadyExists){
                await Employee.findByIdAndUpdate(employeeId,{
                    $push:{currentProjects:projectId}
                })
            }
        }
     
        console.log(updatedDoc)   

        res.status(200).json(updatedDoc);    
        
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"})
    }

}



// Delete project
projectCtrl.DeleteProject = async(req,res)=>{
    const projectId = req.params.id;

    if(!(typeof projectId === 'string' || ObjectId.isValid(projectId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }
    
    try {
        const project = await Project.findById(projectId);

        if(!project) return res.status(404).json({msg:"Project doesn't exist"})

        project?.tasks?.forEach(async(task)=>{
            return(
                await Employee.findByIdAndUpdate(task.assignee,{
                    $pull:{currentProjects: project._id}
                })
            )
        })

        await Project.findByIdAndDelete(projectId);
        res.sendStatus(204)
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"})
    }
}


module.exports = projectCtrl;