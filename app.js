
if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}
const Attendance = require('./models/Attendance');
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const methodOverride = require('method-override');
const path=require("path");
const MONGO_URL=('mongodb://0.0.0.0:27017/Construction');
const ejsMate=require("ejs-mate");
const flash=require("connect-flash");

const session=require("express-session");
const cookieParser = require('cookie-parser');
app.use(cookieParser("secretcode"));
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js")
const UserRoute=require("./routes/user.js");
const signup=require("./routes/signup.js");
const listings =require("./routes/listing.js")
const attendanceController = require('./controllers/attendanceController');
const pdfkit = require('pdfkit');
const fs = require('fs');
const bodyParser = require('body-parser');
const { isloggedIn,isOwner} = require("./middleware.js");


app.use(bodyParser.json());
app.use(express.static('public'));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")))

const sessionOptions=(session({
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true,
    cookie:
    {
        expiers:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
})  
);

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

 

main()
.then((res)=>{
    console.log("connected to DB");
})
.catch((err)=>
{
    console.log(err);
})

async function main()
{
    await mongoose.connect(MONGO_URL);
}


const invoiceSchema = new mongoose.Schema({
    date: String,
    description: String,
    rate: Number,
    hours: Number,
    username:String,
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

app.use((req,res,next)=>
{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    // console.log(currUser);
    next();
})


app.post('/invoices', isloggedIn ,async (req, res) => {
    const invoiceData = req.body;
    let name=req.body.username;
    console.log(name);
    // Save the invoice data to MongoDB
    const newInvoice = new Invoice(invoiceData);
    newInvoice.save()
        .then(savedInvoice => {
            console.log('Invoice generated and saved:', savedInvoice);
            res.json(savedInvoice);
        })
        .catch(err => {
            console.error('Error saving invoice:', err);
            res.status(500).json({ error: 'Failed to generate invoice' });
        });
});


app.get('/invoices/:id',isloggedIn,async (req, res) => {
    const invoiceId = req.params.id;

    // Fetch invoice data from MongoDB
    Invoice.findById(invoiceId)
        .then(invoice => {
            if (!invoice) {
                console.error('Invoice not found');
                res.status(404).send('Invoice not found');
                return;
            }

            // Create PDF
            const doc = new pdfkit();
            const filePath = `invoice_${invoiceId}.pdf`; // Define file path
            const fileStream = fs.createWriteStream(filePath); // Create write stream

            doc.pipe(fileStream);

            doc.fontSize(16).text('Invoice', { align: 'center' });
            doc.fontSize(12).text(`Date: ${invoice.date}`);
            doc.text(`Description: ${invoice.description}`);
            doc.text(`Rate: $${invoice.rate}`);
            doc.text(`Hours Worked: ${invoice.hours}`);
            doc.text(`Total: $${invoice.rate * invoice.hours}`);
            doc.text(`username:${invoice.username}`);
            doc.end();

            // When PDF is finished writing, send it for download
            fileStream.on('finish', () => {
                res.download(filePath, (err) => {
                    if (err) {
                        console.error('Error downloading invoice:', err);
                        res.status(500).send('Failed to download invoice');
                    } else {
                        console.log('Invoice downloaded successfully');
                    }

                    // Delete the file after it's downloaded
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting invoice file:', err);
                        } else {
                            console.log('Invoice file deleted successfully');
                        }
                    });
                });
            });

            // Handle errors during PDF generation
            fileStream.on('error', (err) => {
                console.error('Error generating PDF:', err);
                res.status(500).send('Failed to generate PDF');
            });
        })
        .catch(err => {
            console.error('Error fetching invoice:', err);
            res.status(500).send('Failed to fetch invoice');
        });
});
app.use("/home",async(req,res)=>
{
    res.render("listings/home.ejs");
})

app.use("/invoice",isloggedIn,async(req,res)=>
{
    res.render("./listings/invoice.ejs");
})

app.use("/listings",listings);
app.use("/", UserRoute);
app.use("/",signup);
app.use("/contact",async(req,res)=>
{
    res.render("./listings/contact.ejs");
})

// Routes
app.get('/:id',isloggedIn,attendanceController.getAttendance);
app.post('/mark-attendance', attendanceController.markAttendance);
app.all("*",(req,res,next)=>
{
    next(new ExpressError(404 ,"Page Not Found!"));
})

app.use((err,req,res,next)=>
{
   let {statuscode=500 ,message="something went wrong"}=err;
   res.render("err.ejs",{message});
})

app.listen(3000,()=>{
    console.log("server is listening to port 3000");
})


app.set("views",path.join(__dirname,"/views"));