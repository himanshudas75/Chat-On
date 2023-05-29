const dotenv=require("dotenv");
dotenv.config();
const express=require("express");
const colors = require("colors");
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes= require('./routes/messageRoutes');
const {notFound,errorHandler} =require('.//middleware/errorMiddleware')
const User = require('./models/userModel');
const path= require('path');
const bodyParser= require('body-parser');

const app=express();

const connectDB = require("./config/db");
connectDB();  // This should be after dotenv.config();

app.use(express.json()); // to accept JSON Data
app.use(bodyParser.urlencoded({extended:false}));

//setting view engine
app.set('view engine','pug');
app.use(express.static('public'));

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use("/api/message", messageRoutes);

// //------------------------Deployment-------------------

// const __dirname1=path.resolve();
// if(process.env.NODE_ENV==='production'){
//     app.use(express.static(path.join(__dirname1,"/frontend/build")));

//     app.get("*", (req,res)=>{
//         res.sendFile(path.resolve(__dirname1,"frontend", "build", "index.html"));
//     })
// }else {
//     app.get('/', (req,res)=>{
//         res.send("API is Running");
//     });
// }

//------------------------Deployment-------------------

//error handling for invalid routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server=app.listen(PORT,console.log(`Server Started on PORT ${PORT}`.yellow.bold));

//socket.io configuration
const io= require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on("connection", (socket)=>{
    console.log("connected to socket.io");

    socket.on("setup", (userData)=>{
        socket.join(userData._id);
        console.log(userData._id)
        socket.emit("connected",userData.name);
    });

    socket.on("join chat", (room)=>{
        socket.join(room);
        console.log("User Joined Room:"+ room);
    });

    socket.on('typing',(room)=>socket.in(room).emit("typing"));
    socket.on('stop typing',(room)=>socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved)=>{
        var chat= newMessageRecieved.chat;

        if(!chat.users) return console.log("chat.users not defined");

        chat.users.forEach( async user =>{
            if (user._id === newMessageRecieved.sender._id) return;
            const data=await User.findByIdAndUpdate(
                user._id,
                {$push:{notifications:newMessageRecieved._id}},
                {new:true}
            );

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        })
    });


    socket.off("setup", ()=>{
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    })
})
// console.log(path.dirname(process.mainModule.filename));