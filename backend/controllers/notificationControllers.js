const asyncHandler = require('express-async-handler');
const User= require('../models/userModel');
const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');

const getnotifications= asyncHandler(async (req,res)=>{
    try
    {
        var data=await User.findById(req.user._id).populate("notifications");
        data=await User.populate(data,{
            path:'notifications.sender',
            select:'name pic email'
        });
        data=await Chat.populate(data,{
            path:'notifications.chat',
        });
        data=await User.populate(data,{
            path:'notifications.chat.users',
        });
        
        res.status(200);
        res.json(data.notifications);
    }
    catch (error)
    {
        res.status(400);
        throw new Error(error.message);
    }
});


const removenotification=asyncHandler(async (req,res)=>{
    const {chatId}=req.body;
    try
    {
        var data=await User.findById(req.user._id).populate("notifications");

        const notifications=data.notifications.map(noti=>noti.chat!=chatId?noti.chat:null);
        const newdata= await User.findByIdAndUpdate(
            req.user._id,
            {notifications:notifications},
            {new:true}
        ).populate("notifications");
        res.status(200);
        res.json(newdata.notifications);
    }
    catch (error)
    {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports={getnotifications,removenotification};