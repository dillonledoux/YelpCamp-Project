var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// ====================
// COMMENTS ROUTES
// ====================
// New comment show page
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

//create new comment
router.post("/",middleware.isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err || !campground){
           console.log(err);
           req.flash("error", "Something went wrong...");
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
               req.flash("error", "Something went wrong...");
               res.redirect("/campgrounds");
           } else {
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               comment.save();
               campground.comments.push(comment);
               campground.save();
               req.flash("success", "Comment posted successfully!");
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, comment){
        if(err || !comment){
            console.log(err);
            req.flash("error", "Something went wrong...");
            res.redirect("back");
        } else{
            res.render("comments/edit", {comment: comment, campground_id: req.params.id});
        }
    });
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err || !updatedComment){
            console.log(err);
            req.flash("error", "Something went wrong...");
            res.redirect("/campgrounds");
        }
        else{
            req.flash("success", "Comment updated successfully!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, removedComment){
        if(err || !removedComment){
            console.log(err);
            req.flash("error", "Something went wrong...");
            res.redirect("/campgrounds");
        } else{
            req.flash("success", "Comment was deleted");
            res.redirect("/campgrounds/" +req.params.id);
        }
    })
})

module.exports = router;