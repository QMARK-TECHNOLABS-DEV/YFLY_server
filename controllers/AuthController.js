const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const authCtrl = {};

const generateAccessToken = (userInfo)=>{
    return jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"5m"} )
}

const generateRefreshToken = (userInfo)=>{
    return jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET, {expiresIn:"30d"})
}

authCtrl.Login = async(req,res)=>{
    const {email} = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email)) return res.status(400).json({msg:"Invalid Email format"});

    try {
    const user = await User.findOne({email}).lean();
    if(!user) return res.status(401).json({msg:"Invalid email or password"});
    
    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword) return res.status(401).json({msg:"Invalid email or password"});
    
        const accessToken = generateAccessToken({userId:user._id, role: user.role})

        const refreshToken = generateRefreshToken({userId:user._id, role: user.role})

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            $push:{refreshTokens : refreshToken}
        },{new:true})

        const {password,refreshTokens, ...userInfo} = user;

        res.cookie('access_token',accessToken,{httpOnly:true, maxAge:1000*60*5});
        res.cookie('refresh_token', refreshToken, {httpOnly:true, maxAge:1000*60*60*24*30})

        res.status(200).json(userInfo)

    } catch (error) {
        console.error(error)
        res.status(500).json({msg:"Something went wrong"})
    }
}

authCtrl.regenerateAccessToken = async(req,res)=>{
    const refreshToken = req.cookies.refresh_token;

    if(refreshToken == null) return res.sendStatus(400);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err,user)=>{
        if(err) return res.sendStatus(400)

        const accessToken = generateAccessToken({userId:user._id, role:user.role});

        res.cookie("access_token", accessToken, {httpOnly:true, maxAge: 1000*60*5})

        res.json({msg:"Access token regenerated"});
    })
}

authCtrl.Logout = async(req,res)=>{
    // const updatedUser = await User.findByIdAndUpdate(user._id, {
    //     $pull:{refreshTokens : refreshToken}
    // },{new:true})
    
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.sendStatus(204)
}

module.exports = authCtrl;