const express  = require("express"),
      router   = express.Router(),
      passport = require("passport"),
      User     = require("../models/user")

// ==============
// PRIMARY ROUTES
// ==============
router.get("/", (req, res) => {
    res.render("landing");
});

// ===========
// AUTH ROUTES
// ===========
// Show registration form
router.get("/register", (req, res) => {
    res.render("register");
});

// Submit registration form
router.post("/register", (req, res) => {
    const newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            req.flash("error", `${err.message}.`);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", `Welcome to YelpCamp, ${user.username}!`);
            res.redirect("/campgrounds");
        });
    });
});

// Show login form
router.get("/login", (req, res) => {
    res.render("login");
});

// Submit login form
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}));

// Handle logout
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged out successfully.");
    res.redirect("/campgrounds");
});

module.exports = router;
