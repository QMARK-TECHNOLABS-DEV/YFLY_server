const Employee = require("../models/EmployeeModel")
const bcrypt = require("bcrypt");
const employeeCtrl = {};

//Create Employee;

employeeCtrl.CreateEmployee = async(req,res)=>{
    if(req.user.role !== "admin"){
        return res.status(401).json({msg:"Unauthorized"})
    }

    const {name,email,password,education,
        department,birthDate,address,image,
        currentApplication} = req.body;

    if(!name && !email && !password){
        return res.status(400).json({msg:"Invalid inputs"})
    }   

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

    const alreadyExists = await Employee.findOne({email}).lean();
    if(alreadyExists){
        return res.status(400).json({msg:"Employee already exists"})
    }

    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newDocument = new Employee({
            name,email,
            password:hashedPassword,
            education,department,
            birthDate,address,image,
            currentApplication
        });

        const savedDoc = await newDocument.save();
        console.log("Saved employee", savedDoc);

        res.status(200).json({msg:"New employee created"});
    }catch(error){
        console.error(error);
        res.status(500).json({msg:"Something went wrong"})
    }
}

module.exports = employeeCtrl;