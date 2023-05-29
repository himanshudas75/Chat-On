const jwt = require('jsonwebtoken');
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");
const path = require("path")
const fs = require('fs');
const axios = require("axios")

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

function compareFaces(img1path, img2path)
{
    const img1 = fs.readFileSync(img1path, {encoding: 'base64'});
    const img2 = fs.readFileSync(img2path, {encoding: 'base64'});
    
    const URL = 'https://api-us.faceplusplus.com/facepp/v3/compare'

    axios.post(URL, {
        "api_key": process.env.API_KEY,
        "api_secret": process.env.API_SECRET,
        "image_base64_1": img1,
        "image_base64_2": img2
    }).then(function(response) {
    // console.log(response.data)
        console.log("RESPONSE")
    }).catch(function(error) {
    console.log(error)
        console.log("ERROR")
    })

}   

const {uploadtempfile}= require('../middleware/tempImgMiddleware');
const verifyFacedata =asyncHandler(async(req,res)=>{
    await uploadtempfile(req,res);
    const user=await User.findById(req.user._id);

    const img1path = path.join(path.dirname(process.mainModule.filename),'faceData',user.facedata);
    const img2path=req.file.path;

    compareFaces(img1path, img2path);

    res.json({message:"image2"})
})

module.exports= {protect,verifyFacedata};