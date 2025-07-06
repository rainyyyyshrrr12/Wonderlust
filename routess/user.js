const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const { saveredirectUrl } = require("./listing.js");

router.get("/signup", async (req, res) => {
    res.render("users/signup.ejs");
});
router.post("/signup", async (req, res) => {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
        if (err) {
            console.log(err);
           return next(err);
        }

         // If login is successful, redirect to listings
        req.flash("success", "Welcome to the app!");
        res.redirect("/listings");
    }); 
    }
    catch (err) {
        console.log(err);
        req.flash("error", "Error creating user");
        res.redirect("/signup");
    }
    });
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});
router.post("/login",
    passport.authenticate("local",{failureRedirect: "/login", failureFlash: true}),
       async (req, res,) => {
        req.flash("success", "Logged in successfully");
        res.redirect("/listings");
       }
    );

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
            req.flash("error", "Logout failed");
            return res.redirect("/listings");
        }
        req.flash("success", "Logged out successfully");
        res.redirect("/listings");
    });
});

    
module.exports = router;