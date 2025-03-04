const express=require("express");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User");   

const router=express.Router();

router.post("/SignUp",async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        const hashedpass=await bcrypt.hash(password,10);
        const user=new User({
            username,email,password:hashedpass
        });
        await user.save();
        res.status(201).json({message:"User created successfully"});
    }
    catch(error){
        console.error("SignUp Error:", error.message); 
        res.status(500).json({message:"Error creating user"});
}
});

router.post("/SignIn",async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"No user found"});
        }
        console.log("User found:", user);
        const match=await bcrypt.compare(password,user.password);
        console.log("Password comparison result:", match);
        if(!match){
            console.log("Password does not match");
            return res.status(400).json({message:"Invalid Credentials"});
        }
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET  
        );
        res.status(200).json({token});
    } catch(error){
        console.error("SignIn Error:", error.message);
        res.status(500).json({message:"Error signing in"});
    }
});

router.post("/passwordReset",async(req,res)=>{
    try{
        const {email,newPassword}=req.body;
        const user=await User.findOne({
            email
        });
        if(!user){
            return res.status(400).json({message:"No user Found"});
        }
        const hashedpass=await bcrypt.hash(newPassword,10);   
        await User.findOneAndUpdate
        ({email},{password:hashedpass});
        await user.save();
        res.status(200).json({message:"Password reset successful"});
    } catch(error){
        res.status(500).json({message:"Error resetting password"});
    }
    


});

module.exports = router;


