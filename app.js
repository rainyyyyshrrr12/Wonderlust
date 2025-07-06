if(process.env.NODE_ENV !== "production") {
require('dotenv').config();
}
console.log(process.env);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing =require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const engine = require('ejs-mate');
const mongourl = "mongodb://127.0.0.1:27017/wonderlust";

const Review = require("./models/review.js");
const listings = require("./routess/listing.js");
const session = require("express-session");
// const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const userRoutes = require("./routess/user.js");
main()
  .then(() => {
    console.log("DB is connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function main(){
    await mongoose.connect(mongourl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static('public'));




  

const sessionoptions = {
  secret: "thisshouldbeasecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires:Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 days
    maxAge: 1000 * 60 * 60 * 24 * 3, 
    httpOnly: true, // Helps prevent XSS attacks
  },
};






app.use(session(sessionoptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; // Make currentUser available in all views
  next();
});

app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "student@gmail.com",
    username: "student",
  });
   
 let registeresUser = await User.register(fakeUser,"helloworld");
 res.send(registeresUser);
});

app.use("/listings", listings);
app.use("/", userRoutes);



app.post("/listings/:id/reviews", async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);  // lowercase 'listing'
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("New review saved!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Something went wrong.");
  }
});

//delete review

app.delete("/listings/:id/reviews/:reviewId",async(req,res)=>{
  let { id,reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, {$pull:{reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
});

app.use((req,res,next) => {
  res.status(404).send("Page not found");
});


app.listen(8080, () => {
  console.log("Your server is running on port 8080");
});