const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

//root route
router.get("/", function(req, res){
    res.render("landing");
});


//  ===========
// AUTH ROUTES
//  ===========

// show register form
router.get("/register", function(req, res){
    res.render("register"); 
 });
 //handle sign up logic
 router.post("/register", function(req, res){
     let newUser = new User({username: req.body.username});
     User.register(newUser, req.body.password, function(err, user){
         if(err){
             console.log(err);
             req.flash("error", err.message);
             return res.render("register");
         }
         passport.authenticate("local")(req, res, function(){
            req.flash("success", `Successfully Registered, welcome to YelpCamp ${req.body.username}!`);
            res.redirect("/campgrounds"); 
         });
     });
 });
 
 // show login form
 router.get("/login", function(req, res){
    res.render("login"); 
 });
 // handling login logic
 router.post("/login", passport.authenticate("local", 
     {
         successRedirect: "/campgrounds",
         failureRedirect: "/login"
     }), function(req, res){
 });
 
 // logic route
 router.get("/logout", function(req, res){
    req.logout();
    req.flash("error", "Successfully logged out!");
    res.redirect("/campgrounds");
 });

module.exports = router;
