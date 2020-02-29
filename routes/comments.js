const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware")

// NEW - Show form to add a comment to a campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        err ? console.log(err) : res.render("comments/new", {campground: campground});
    });
});

// CREATE - Add a new comment to a campground
router.post("/", middleware.isLoggedIn, async (req, res) => {
    try {
        // Look up campground using ID
        campground = await Campground.findById(req.params.id);
        comment = await Comment.create(req.body.comment);
        // Associate user with comment
        comment.author.id = await req.user._id;
        comment.author.username = await req.user.username;
        // Save comment
        await comment.save();
        await campground.comments.push(comment);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    }
    catch(err) {
        console.log(err);
        res.redirect("/campgrounds");
    }
});

// EDIT - Show a page to edit a comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, async (req, res) => {
    try {
        campground = await Campground.findById(req.params.id, (err, campground) => {
            if(err || !campground){
                req.flash("error", "No campground found, so no comment found. Sorry bout it!");
                res.redirect("back");
            }
        });
        comment = await Comment.findById(req.params.comment_id);
        res.render("comments/edit", {comment: comment, campground: campground});
    } catch(err) {
        req.flash("error", "No edit comment for you!");
        campground ? res.redirect(`/campgrounds/${campground._id}`) : res.redirect("/campgrounds");
    }
});

// UPDATE - Save edited comment to db
router.put("/:comment_id", middleware.checkCommentOwnership, async (req, res) => {
    try {
        campground = await Campground.findById(req.params.id, (err, campground) => {
            if(err || !campground){
                req.flash("error", "No campground found, so no comment found. Sorry bout it!");
                return res.redirect("back");
            }
        });
        comment = await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
        res.redirect(`/campgrounds/${campground._id}`);
    } catch(err) {
        req.flash("error", "No edit comment for you!");
        campground ? res.redirect(`/campgrounds/${campground._id}`) : res.redirect("/campgrounds");
    }
});

// DESTROY - Delete a comment
router.delete("/:comment_id", middleware.checkCommentOwnership, async (req, res) => {
    try {
        await Comment.findByIdAndRemove(req.params.comment_id);
        req.flash("success", "Comment deleted.");
        return res.redirect(`/campgrounds/${req.params.id}`);
    } catch {
        req.flash("error", "No delete comment for you!");
        campground ? res.redirect(`/campgrounds/${campground._id}`) : res.redirect("/campgrounds");
    }
});

module.exports = router;
