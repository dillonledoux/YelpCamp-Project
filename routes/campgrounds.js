require("dotenv").config();
const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware");
const NodeGeocoder = require("node-geocoder");

const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GOOGLE_API,
    formatter: null
};

const geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    const name = req.body.name;
    const image = req.body.image;
    const price = req.body.price;
    const desc = req.body.description;
    const author = {
        id: req.user._id,
        username: req.user.username
    };

    geocoder.geocode(req.body.location, function(err, data){
        if(err || !data.length){
            req.flash('error', 'Invalid Address');
            console.log(error);
            return res.redirect('back');
        }
        const lat = data[0].latitude;
        const lng = data[0].longitude;
        const location = data[0].formattedAddress;
        const newCampground = {name: name, image: image, price: price, description: desc, author: author, location: location, lat: lat, lng: lng};
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
                req.flash("error", "Something went wrong, please try again later");
                res.redirect("/campgrounds");
            } else {
                //redirect back to campgrounds page
                req.flash("success", `Successfully added the campground ${newlyCreated.name}!`);
                res.redirect("/campgrounds");
            }
        });
    });
   // Create a new campground and save to DB  
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            console.log(err);
            req.flash("error", "Campground Not Found");
            res.redirect("/campgrounds");
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground, GOOGLE_API: process.env.GOOGLE_API});
        }
    });
});
//Edit route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            console.log(err);
            req.flash("error", "Campground Not Found");
            res.redirect("/campgrounds");
        } else{
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data){
        if(err || !data.length){
            req.flash("error", "Invalid address");
            return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            if(err || !updatedCampground){
                console.log(err);
                req.flash("error", "Campground Not Found");
                res.redirect("/campgrounds");
            }
            else{
                res.redirect(`/campgrounds/${req.params.id}`);
            }
        });

    });  //find and update the campground
    
});

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err, removedCampground){
        if(err || !removedCampground){
            console.log(err);
            req.flash("error", "Campground Not Found");
            res.redirect("/campgrounds");
        } else{
            req.flash("success", `Successfully deleted the campground ${removedCampground.name}`);
            res.redirect("/campgrounds");
        }
    })
})



module.exports = router;