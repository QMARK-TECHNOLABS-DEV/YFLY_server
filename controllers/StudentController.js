const Student = require("../models/StudentModel")
const bcrypt = require("bcrypt");
const studentCtrl = {};

//Create Student;

studentCtrl.CreateStudent = async(req,res)=>{
    if(req.user.role !== "admin"){
        return res.status(401).json({msg:"Unauthorized"})
    };

    const {name,email,password,phone,
        birthDate,age,qualification,
        address,image} = req.body;

    if(!name && !email && !password){
        return res.status(400).json({msg:"Invalid inputs"})
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

    const alreadyExists = await Student.findOne({email}).lean();
    if(alreadyExists){
        return res.status(400).json({msg:"Student already exists"})
    }

    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDocument = new Student({
            name,email,
            password:hashedPassword,
            phone,birthDate,age,
            qualification,address,image
        });

        const savedDoc = await newDocument.save();
        console.log("Saved Student", savedDoc);
        
        res.status(200).json({msg:"New Student created"})
    }catch(error){
        console.error(error);
        res.status(500).json({msg:"Something went wrong"});
    }
}

module.exports = studentCtrl;