// npm init
// npm install express ejs --save
//setup the root route app.get "/" using res.send
//make views directory and then create an ejs file for the landing page in ejs
//create header.ejs and footer.ejs files in views/partials and then put the html header and footer inside
// add a post route for campgrounds
//install bodyparser: npm install body-parser --save

//require packages
var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seeds");

//require routes
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    authRoutes          = require("./routes/index");


//use packages
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs"); // allows not specifying ejs on all the files
app.use(express.static(__dirname + "/public")); //conventional way of serving the public directory
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed the database


// Passport Configuration
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//check for current user
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//use routes from other files
app.use(authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


//listen for server
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The yelpcamp server has started!");
});