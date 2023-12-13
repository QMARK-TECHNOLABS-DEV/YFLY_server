const Admin = require("../models/AdminModel")
const Employee = require("../models/EmployeeModel")
const Student = require("../models/StudentModel")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authCtrl = {};

const expiryAccessToken = "5m";
const expiryRefreshToken = "30d";

const maxAgeAccessCookie = 1000*60*5;
const maxAgeRefreshCookie = 1000*60*60*24*30;

//Create Access Token;

const generateAccessToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiryAccessToken })
}

//Create Refresh Token;

const generateRefreshToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET, { expiresIn: expiryRefreshToken })
}

// Authentication method for Admin/Employee/Student;

authCtrl.Login = async (req, res) => {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

    try {
        const admin = await Admin.findOne({ email }).lean();
        const employee = await Employee.findOne({ email }).lean();
        const student = await Student.findOne({ email }).lean();

        let user;

        if(admin){
            user = admin;
        } else if(employee){
            user = employee;
        } else if(student){
            user = student;
        } else{
            return res.status(401).json({ msg: "Invalid email" })
        }

        console.log("user",user)

        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) return res.status(401).json({ msg: "Invalid password" });

        const accessToken = generateAccessToken({ userId: user._id, role: user.role })

        const refreshToken = generateRefreshToken({ userId: user._id, role: user.role })

        const { password, ...userInfo } = user;

        res.cookie('access_token', accessToken, { httpOnly: true, maxAge: maxAgeAccessCookie });
        res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: maxAgeRefreshCookie })

        res.status(200).json(userInfo)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}

//Regenerate Access Token using Refresh Token;

authCtrl.regenerateAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken == null) return res.sendStatus(400);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(400)

        const accessToken = generateAccessToken({ userId: user._id, role: user.role });

        res.cookie("access_token", accessToken, { httpOnly: true, maxAge: maxAgeAccessCookie })

        res.json({ msg: "Access token regenerated" });
    })
}

//Terminate session by deleting tokens in frontend;

authCtrl.Logout = async (req, res) => {

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.sendStatus(204)
}

module.exports = authCtrl;