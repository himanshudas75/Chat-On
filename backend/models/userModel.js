const mongoose= require("mongoose");
const bcrypt =require("bcryptjs");

const userSchema = mongoose.Schema({
    name: {type: String, required:true},
    email: {type: String, required:true, unique:true},
    password: {type: String, required:true},
    facedata: String,
    faceverification:{
        type:Boolean,
        default: false
    },
    pic:{
        type: String,
        default:
            "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    notifications:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Message"
        }
    ]
},
{
    timestamps: true,
}
);


// creating a method of userSchema to check password while login
userSchema.methods.matchPassword= async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

//This will run before everytym a user is saved or modified
userSchema.pre('save', async function(next){
    if(!this.isModified)
    {
        next();
    }

    //here comes hashing password of users
    const salt= await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

const User = mongoose.model("User", userSchema);

module.exports= User;