var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),         
    User            = require("./models/user"),
    seedDB          = require("./seeds")

//route files being required
var auth_indexRoutes = require("./routes/auth_index"),
    commentsRoutes = require("./routes/comments"),
    campgroundsRoutes = require("./routes/campgrounds");
    
mongoose.connect("mongodb+srv://dillon:WiByfXnqPrX3of1G@cluster0-rnyae.mongodb.net/test?retryWrites=true&w=majority");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

// PASSPORT CONFIGURATION
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

//makes current user available to every route
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");

   next();
});

//Routes
app.use("/" ,auth_indexRoutes);
app.use("/campgrounds/:id/comments", commentsRoutes);
app.use("/campgrounds", campgroundsRoutes);

//Server config
app.listen("3000", "127.0.0.1", function(){
   console.log("The YelpCamp Server Has Started!");
});