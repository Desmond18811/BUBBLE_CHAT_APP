import mongoose from "mongoose";
import {genSalt, hash} from "bcrypt";

const userSchema = new mongoose.Schema({
    email: {
        type:String,
        required: [true, "Email is required"],
        unique:true,
    },
    password: {
        type:String,
        required: [true, "Password is required"],
        minLength:5,
    },
    firstName: {
        type:String,
        required: false
    },
    lastName: {
        type:String,
        required: false
    },
    Image: {
        type:String,
        required: false
    },
    Color: {
        type: Number,
        required: false
    },
    profileSetup: {
        type: Boolean,
        default: false
    }
})

userSchema.pre("save", async function (next) {
        const salt  = await genSalt(10)
       this.password = await hash(this.password, salt);
        next();
})

const User = mongoose.model("User", userSchema);

export default User;