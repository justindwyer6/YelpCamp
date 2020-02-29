// External Dependencies
const dotenv         = require('dotenv').config()
      express        = require("express"),
      app            = express(),
      bodyParser     = require("body-parser"),
      mongoose       = require("mongoose"),
      passport       = require("passport"),
      localStrategy  = require("passport-local"),
      methodOverride = require("method-override"),
      flash          = require("connect-flash")
// Internal Dependencies
const Campground       = require("./models/campground"),
      Comment          = require("./models/comment"),
      User             = require("./models/user"),
      commentRoutes    = require("./routes/comments"),
      campgroundRoutes = require("./routes/campgrounds"),
      indexRoutes      = require("./routes/index"),
      seedDB           = require("./seeds")

// Connect to the database
db_url = process.db.DB_URL || "mongodb://localhost:27017/yelp_camp"
mongoose.connect(db_url, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log("Connected to mongodb!");
}).catch(err => {
    console.log(`ERROR: ${err.message}`);
});

// App Configuration
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride("_method"));
app.use(flash());
seedDB();

// Passport Configuration
app.use(require("express-session")({
    secret: "I like to eat tacos and nachos late at night when no one is watching.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Routes
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// Listener
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, () => {
    console.log(`We're camped out at port ${port}.`);
});
