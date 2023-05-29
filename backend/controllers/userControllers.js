const asyncHandler= require('express-async-handler');
const User = require('../models/userModel');
const generateToken =require('../config/generateToken');
const {uploadfile}= require('../middleware/imageMiddleware');
const path= require('path');

const registerUser = asyncHandler(async (req,res)=>{
    const {name, email, password,pic} =req.body;
    if(!name || !email || !password)
    {
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }
    
    const userExists = await User.findOne({email});
    if(userExists)
    {
        res.status(400);
        throw new Error("User already Exists");
    }


    const user = await User.create({
        name,
        email,
        password,
        pic,
    });

    if(user)  //Successfully created new user
    {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            password: user.password,
            pic: user.pic,
            token: generateToken(user._id),
        })
    }
    else //if not Successfully created
    {
        res.status(400);
        throw new Error("Failed to create the User");
    }
});

const postFacedata=asyncHandler(async (req,res)=>{
    await uploadfile(req,res);
    if(req.file===undefined)
    {
        throw new Error({message:"failed to upload your face data!"});
    }
    else
    {
        const faceverification=req.body.enable==="true"?true:false;
        // res.json({message: req.file})
        const user= await User.findByIdAndUpdate(req.user._id,{facedata:req.file.filename,faceverification:faceverification},{new:true});
        res.status(200).json(user);
    }
});

const authUser =asyncHandler(async (req,res)=>{
    const {email,password} = req.body;

    const user = await User.findOne({email});

    if(user && (await user.matchPassword(password))) // Checking user and natching password if found!
    {
        res.json({
            
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        })
    }
    else
    {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

//   /api/user?search=<anyusename>
const allUsers = asyncHandler(async (req,res)=>{
    const keyword = req.query.search ? {
        $or: [
            {name : {$regex: req.query.search, $options: "i"}},
            {email : {$regex: req.query.search, $options: "i"}},
        ]
    }
    :{};

    const users = await User.find(keyword).find({_id: { $ne: req.user._id }}).select("-password");
    res.send(users);
})


module.exports= {registerUser, postFacedata, authUser, allUsers};