const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Attendance=require("./Attendance.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    Name:String,
    Address:String,
    image:{
    url:String,
    filename:String,
    },
    contact: Number,
    location:String,
    // reviews:[
    //     {
    //         type:Schema.Types.ObjectId,
    //         ref:"Review"
    //     },
    // ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    Attendance:[
        {
        type:Schema.Types.ObjectId,
        ref:"Attendance",
    }
],
});

listingSchema.post("findOneAndDelete",async(listing)=>
{
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews }})
    }
})

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;