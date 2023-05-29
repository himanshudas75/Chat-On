const jwt = require('jsonwebtoken');
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");
const path = require("path")
const fs = require('fs');
const axios = require("axios")
const FormData= require('form-data');

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

const compareFaces= async (img1path, img2path)=>
{
    const img1 = fs.readFileSync(img1path, {encoding: 'base64'});
    const img2 = fs.readFileSync(img2path, {encoding: 'base64'});
    
    const URL = 'https://api-us.faceplusplus.com/facepp/v3/compare'
    
    const params= new FormData();
    params.append('api_key',process.env.API_KEY)
    params.append('api_secret',process.env.API_SECRET)
    params.append('image_base64_1',img1)
    params.append('image_base64_2',img2)


    try{
        const response= await axios(
            {
                method:"post",
                url: URL,
                data:params
            }
        );
        return(response);
    }
    catch (error)
    {
        console.log(error);
    }

}   

const {uploadtempfile}= require('../middleware/tempImgMiddleware');
const { error } = require('console');
const verifyFacedata =asyncHandler(async(req,res)=>{
    await uploadtempfile(req,res);
    const user=await User.findById(req.user._id);

    const img1path = path.join(path.dirname(process.mainModule.filename),'faceData',user.facedata);
    const img2path=req.file.path;

    const response=await compareFaces(img1path, img2path);
    if(response.data.confidence)
    {
        res.json({message:(response.data.confidence>=75),condidence:response.data.confidence});
    }
    else
        throw new Error("Error Occured while Comparing faces!")
})
module.exports= {protect,verifyFacedata};
