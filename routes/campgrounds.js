var express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware"); //will automatically run index.js by default


//CAMPGROUND ROUTES

//INDEX - shows all campgrounds
router.get("/", function(req, res){
    //get data from db
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
        //first parameter in {} is referring to the db name
            res.render("campgrounds/index", { campgrounds: allCampgrounds}); 
        }
    });
});

//CREATE - posts a new campground to the DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author: author}
    //create a new campground and save to db
    Campground.create(newCampground, function(err, newlyCreated){
        if(err || !newlyCreated){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            req.flash("success", "Campground created.");
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});

//NEW - shows form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

//SHOW - This shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found.");
            res.redirect("back");
        } else {
            console.log(foundCampground);
            //render show template
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT - edits the campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE - updates the campground
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   //find and update the correct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err || !updatedCampground){
           req.flash("error", "Something went wrong. Try again.");
           res.redirect("/campgrounds");
       } else {
           //redirect (show page)
           req.flash("success", "Campground updated.");
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
});

// DESTROY - deletes campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "Something went wrong. Try again.");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground deleted.");
            res.redirect("/campgrounds");   
        }
    });
});

module.exports = router;