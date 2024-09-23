const Listing=require("../models/listing");



// index route
module.exports.index=async(req,res,next)=>{
    try{
        if(res.locals.currUser)
        {
            const allListings = await Listing.find({owner:res.locals.currUser})
            res.render("listings/index.ejs",{allListings});
        }
        else
        {
            res.render("listings/home.ejs");
        }
    }
    catch(err)
    {
        next(err)
    }
};

module.exports.renderNewForm=(req,res,next)=>{
    try
    {
        res.render("listings/new.ejs");
    }
    catch(err)
    {
        next(err)
    }
};


module.exports.Createnewlisting= async(req,res,next)=>
{
    try
    {
        let url=req.file.path;
        let filename=req.file.filename;

        const newListing =new Listing(req.body.listing);
        newListing.owner=req.user._id;
        newListing.image={url,filename};
        await  newListing.save();
        req.flash("success","new Listing Created");
        res.redirect("/listings");
    }
    catch(err)
    {
        next(err)
    }
}

module.exports.showlistings= async (req,res,next)=>
{
try{
    let {id}=req.params;
    const listing= await Listing.findById(id).populate("owner");
    if(!listing)
    {
        req.flash("error","listing you requested for does not exist");
        res.redirect("/listings");
    }
     res.render("listings/show.ejs",{listing})
}
catch(err)
{
    next(err)
}
};

module.exports.editListings=async(req,res,next)=>
{
    try{
        let {id}=req.params;
        const listing=await Listing.findById(id);
        if(!listing)
        {
            req.flash("error","listing you requested for does not exist");
            res.redirect("/listings");
        }
        let originalimage=listing.image.url;
        originalimage.replace("/upload","/upload/h_30,w_25")
        res.render("listings/edit.ejs",{listing,originalimage});
    }
    catch(err)
    {
        next(err)
    }
}


module.exports.updatelistings= async (req,res,next)=>
{

        let {id}=req.params;
        let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
        if(typeof req.file!=="undefined")
        {
            let url=req.file.path;
            let filename=req.file.filename;
            listing.image={url,filename};
            await listing.save();
        }
        req.flash("success","updated!");
        res.redirect(`/listings/${id}`);
}

module.exports.deletelistings= async(req,res,next)=>
{
    try{
        let {id}=req.params;
        let deletedListing=await Listing.findByIdAndDelete(id);
        req.flash("success","Delete successful");
        res.redirect("/listings");
    }
    catch(err)
    {
        next(err)
    }
}