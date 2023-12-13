const jwt = require("jsonwebtoken");

const authMiddleware = async(req,res,next)=>{
    const token = req.cookies.access_token;

    if(!token) return res.status(401).json({msg:"Unauthorized: Token not provided"})

    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded;
        next();
    }catch(error){
        res.status(401).json({msg:"Unauthorized: Invalid Token"})
    }
}

module.exports = authMiddleware;