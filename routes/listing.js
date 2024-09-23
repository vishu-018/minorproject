const express=require("express");
const router=express.Router();
const {isloggedIn,isOwner}=require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});

// const flash=require("connect-flash");

// router.use(flash());
router.use((req,res,next)=>
{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})



router.route("/")
.get((isloggedIn,listingController.index))
.post(isloggedIn,
    upload.single("listing[image]"),
   (listingController.Createnewlisting)
);

router.get("/new",isloggedIn,listingController.renderNewForm);

router.route("/:id")
.put(isloggedIn,isOwner,upload.single("listing[image]"),listingController.updatelistings)
.delete(isloggedIn,isOwner,listingController.deletelistings);

router.get("/:id",isloggedIn,listingController.showlistings);
router.get("/:id/edit",isloggedIn,isOwner,listingController.editListings); 

module.exports=router;
