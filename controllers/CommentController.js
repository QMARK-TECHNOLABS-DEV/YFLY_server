const mongoose = require("mongoose");
const Comment = require("../models/CommentModel");
const Application = require("../models/ApplicationModel");
const Project = require("../models/ProjectModel");
const Employee = require("../models/EmployeeModel");
const ObjectId = mongoose.Types.ObjectId;
const commentCtrl = {};

// Get all Comments of an Application/Project;
commentCtrl.GetComments = async(req,res)=>{
    const resourceId = req.params.id;
    const resourceType = req.params.type;
     
    console.log("resourceId",resourceId);
    if(!(typeof resourceId === 'string' || ObjectId.isValid(resourceId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }

    if(!(resourceType === "application" || resourceType === "project")){
        return res.status(400).json({msg:"Resource type is invalid"})
    }

    try {

        const comments = await Comment.aggregate([
            {
                $match: {
                    resourceId: new ObjectId(resourceId),
                    resourceType
                }
            },
            {
                $lookup: {
                    from: "admins",
                    localField: "commentorId",
                    foreignField: "_id",
                    as: "adminCommentor"
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "commentorId",
                    foreignField: "_id",
                    as: "employeeCommentor"
                }
            },
            {
                $addFields: {
                    "commentor": {
                        $cond: {
                            if: "$fromAdmin",
                            then: "Admin",
                            else: { $arrayElemAt: ["$employeeCommentor.name", 0] }
                        }
                    }
                }
            },
            {
                $project: {
                    "resourceId": 1,
                    "resourceType": 1,
                    "commentor": 1,
                    "comment": 1,
                    "createdAt": 1
                }
            },
            {
                $sort: {
                    "_id": -1
                }
            }
        ]);
        

        console.log("comments",comments);

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"});
    }
}

// Add comment;

commentCtrl.AddComment = async(req,res)=>{
    const {resourceId,resourceType,
        commentorId,comment} = req.body;
    
    const fromAdmin = req.user.role === "admin";

    if(!(typeof resourceId === 'string' || ObjectId.isValid(resourceId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }

    if(!(typeof commentorId === 'string' || ObjectId.isValid(commentorId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }

    if(typeof comment !== 'string' ){
        return res.status(400).json({msg:"Invalid Comment"});
    };

    if(!(resourceType === "application" || resourceType === "project")){
        return res.status(400).json({msg:"Resource Type is not valid"});
    };

    try {
        if(resourceType === "application"){
            const applicationExists = await Application.findById(resourceId);

            if(!applicationExists){
                return res.status(400).json({msg:"Application doesn't exists"})
            }
        }
        else if(resourceType === "project"){
            const projectExists = await Project.findById(resourceId);

            if(!projectExists){
                return res.status(400).json({msg:"Project doesn't exists"})
            }
        }

        if(!fromAdmin){
            const commentorExists = await Employee.findById(commentorId);
            if(!commentorExists) return res.status(404).json({msg:"Commentor doesn't exist"})

        }

        const newComment = new Comment({
            resourceId: new ObjectId(resourceId),
            resourceType,
            commentorId: new ObjectId(commentorId),
            comment:comment.trim(),
            fromAdmin
        });

        const savedComment = await newComment.save();
        console.log(savedComment);

        res.status(200).json({data:savedComment, msg:"Comment Added"});

    } catch (error) {
        res.status(500).json({msg:"Something went wrong"})
    }
}


module.exports = commentCtrl;