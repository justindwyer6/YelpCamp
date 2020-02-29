const express    = require("express"),
      router     = express.Router(),
      Campground = require("../models/campground"),
      middleware = require("../middleware")

// INDEX – Show campgrounds
router.get("/", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        err ? console.log(err) : res.render("campgrounds/index", {campgrounds: allCampgrounds});
    });
});

// CREATE – Add new campground to database
router.post("/", middleware.isLoggedIn, (req, res) => {
    // Get data from form and add to campgrounds array
    const campground = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        author: {
        id: req.user._id,
        username: req.user.username
        }
    }
    // Create a new campground and save to DB
    Campground.create(campground, (err, newlyCreated) => {
        // Redirect back to campgrounds page
        err ? console.log(err) : res.redirect("/campgrounds");
    });
});

// NEW – Show form to create a new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// SHOW – Show info about one campground
router.get("/:id", (req, res) => {
    // Find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec((err, campground) => {
        // Render show template with that campground
        (err || !campground)
        ? (req.flash("error", "Darngit! That campground might not exist."), res.redirect("/campgrounds"))
        : res.render("campgrounds/show", {campground: campground});
    });
});

// EDIT - Show form to modify an existing campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        res.render("campgrounds/edit", {campground: campground});
    });
});

// UPDATE - Save edits made to a campground
router.put("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        err ? res.send("Error: Go back and try again!") : res.redirect(`/campgrounds/${req.params.id}`);
    });
});

// DESTROY - Delete a campground
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        campground.deleteOne();
        req.flash("success", "Campground deleted.");
        res.redirect("/campgrounds");
    });
});

module.exports = router;
