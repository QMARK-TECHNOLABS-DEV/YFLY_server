const express = require('express');
const app = express();
require("dotenv").config();
const ConnectDB = require("./db");
const cookieParser = require("cookie-parser")
const cors = require("cors");
const path = require("path")
const authRouter = require("./routes/AuthRoute")

const port = process.env.PORT || 8800;
ConnectDB();

app.use(cors({origin:'*',credentials:true}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/images", express.static(path.join(__dirname,"/public/images")))

app.use("/api/auth", authRouter)

app.listen(port,()=>console.log(`Server running on port ${port}`))