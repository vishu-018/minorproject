const express=require("express");
const router=express.Router();
const flash=require("connect-flash");


router.use(flash());
router.post("/signup",async(req,res)=>
{
    try{
        let{username,email,password}=req.body;
        const newUser=new User({email,username});
        const  registerdUser=await User.register(newUser,password);
        console.log(registerdUser);
        req.flash("success","welcome to WanderLust");
        res.redirect("/listings");
    }
    catch(err)
    {
        req.flash("error",err.mesage);
        res.redirect("/signup");
    }
})

module.exports=router;