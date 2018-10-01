var express     = require("express"),
    router      = express.Router({mergeParams: true}), //mergeParams will find the id from other pages
    Campground  = require("../models/campground"),
    Comment     = require("../models/comment"),
    middleware = require("../middleware");

//COMMENT ROUTES

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            req.flash("error", "Something went wrong.");
            console.log(err);
            res.redirect("back");
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    //look up campground using ID
   Campground.findById(req.params.id, function(err, campground){
      if(err || !campground){
          req.flash("error", "Campground not found.");
          res.redirect("/campgrounds");
      } else {
          Comment.create(req.body.comment, function(err, comment){
              if(err){
                  req.flash("error", "Something went wrong.");
                  console.log(err);
              } else {
                  //add username and id to comment
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  //save comment
                  comment.save();
                  //create new comment
                  campground.comments.push(comment);
                  //connect new comment to campground
                  campground.save();
                  //redirect back to campground show page
                  console.log(comment);
                  req.flash("success", "Successfully created comment.");
                  res.redirect("/campgrounds/" + campground._id);
              }
          });
      }
   });
});

//EDIT comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground) {
            req.flash("error", "Campground not found.");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found.");
                res.redirect("back");
                } else {
                    res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
                }
        });
    });
});

//UPDATE comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err || !updatedComment){
          req.flash("error", "Something went wrong. Try again.");
          res.redirect("back");
      } else {
          req.flash("success", "Comment updated.");
          res.redirect("/campgrounds/" + req.params.id);
      }
   });
});

// DELETE comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   //findByIdAndRemove
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           req.flash("error", "Something went wrong. Try again.");
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted.");
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
});

module.exports = router;