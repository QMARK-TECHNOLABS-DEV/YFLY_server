const Application = require("../models/ApplicationModel")
const bcrypt = require("bcrypt");
const Student = require("../models/StudentModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const applicationCtrl = {};

//Create Application;

applicationCtrl.CreateApplication = async(req,res)=>{
    const {studentId,university,course,
        intake,country,creator,steps,
        documents} = req.body;
    
    console.log("reqBody",req.body)
    
    if(!(typeof studentId === 'string' || ObjectId.isValid(studentId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }

    try {
        const student = await Student.findById(studentId);
        console.log(student)
        if(!student) return res.status(404).json({msg:"Student not found"});
    
        const alreadyExists = await Application.findOne({studentId: new ObjectId(studentId)});
        if(alreadyExists) return res.status(400).json({msg:"Application already exists"});

        const newDocument = new Application({
            studentId : new ObjectId(studentId),
            university,course,
            intake,country,
            creator : new ObjectId(creator),
            steps,
            documents
        });

        const application = await newDocument.save();
        console.log("application",application);

        await Student.findByIdAndUpdate(studentId,{
            $set:{applicationId: application._id}
        })

        res.status(200).json({msg:"New Application Created"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:"Something went wrong"})
    }
}

//Get All Applications;
applicationCtrl.GetAllApplications = async(req,res)=>{
    try {
        const allApplications = await Application.find();
        console.log(allApplications);

        res.status(200).json(allApplications);
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"})
    }
}

//Get an Application;
applicationCtrl.GetApplication = async(req,res)=>{
    const applicationId = req.params.id;

    if(!(typeof applicationId === 'string' || ObjectId.isValid(applicationId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }

    try{
        const application = await Application.findById(applicationId);
        console.log(application);
        res.status(200).json(application);
    }catch(error){
        res.status(500).json({msg:"Something went wrong"})
    }
}

//Update Application;
applicationCtrl.UpdateApplication = async (req,res)=>{
    const {applicationId, ...updates} = req.body;
    console.log(req.body);

    if(!(typeof applicationId === 'string' || ObjectId.isValid(applicationId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }

    try {
        const application = await Application.findById(applicationId);
        console.log(application);
        if(!application) return res.status(404).json({msg:"Application not found"});

        const updatedApplication = await Application.findByIdAndUpdate(applicationId,{
            $set: {...updates, updatedAt:Date.now()}
        },{new:true});

        console.log(updatedApplication);

        res.status(200).json({msg:"Application Updated"})
        
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"})
    }

}

//Delete Application;
applicationCtrl.DeleteApplication = async(req,res)=>{
    const applicationId = req.params.id;

    if(!(typeof applicationId === 'string' || ObjectId.isValid(applicationId))){
        return res.status(400).json({msg:"Invalid Id format"});
    }

    try {
        const application = await Application.findById(applicationId);
        if(!application) return res.status(404).json({msg:"Application doesn't exist"});

        await Application.findByIdAndDelete(applicationId);

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"});
    }
}

module.exports = applicationCtrl;