const jwt = require('jsonwebtoken');
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect =asyncHandler(async (req,res,next)=>{
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            //decodes token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password"); // select user with the decoded.id and then save in req.user without password

            next();
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
})


const {uploadtempfile}= require('../middleware/tempImgMiddleware');
const verifyFacedata =asyncHandler(async(req,res)=>{
    await uploadtempfile(req,res);
    res.json({message:"image2"})
})

module.exports= {protect,verifyFacedata};