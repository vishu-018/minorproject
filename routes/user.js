const express=require("express");
const router=express.Router();
const User=require("../models/user.js")
const passport=require("passport");
const { trace } = require("joi");
const {saveRedirectUrl}=require("../middleware.js");
const userController=require("../controllers/user.js");

router.get("/signup",userController.rendersignup);

router.post("/signup",userController.signup);

router.get("/login",userController.renderlogin)

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local",{
        failureRedirect:"/login",   
        failureFlash:true,
    }),userController.login
);

router.get("/logout",userController.logout);

module.exports=router;