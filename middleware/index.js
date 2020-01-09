
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObject = {};

middlewareObject.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObject.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                console.log(err);
                res.redirect("back")
            }else{
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else{
                    req.flash("error", "You don't have permissions to edit this comment");
                    res.redirect("back");
                }
            };
        })
    } else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObject.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                console.log(err);
                res.redirect("back")
            }else{
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else{
                    req.flash("error", "You don't have permissions to edit this campground");
                    res.redirect("back");
                }
            };
        })
    } else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}


module.exports = middlewareObject;