const employeeChecker = (req,res,next)=>{
    if(req.user.role === "admin" || req.user.role === "employee"){
        next()
    }else{
        return res.status(401).json({msg:"Unauthorized"})
    }
}

module.exports = employeeChecker;