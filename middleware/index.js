const Campground = require("../models/campground"),
      Comment    = require("../models/comment")

const middlewareObject = {};

middlewareObject.checkCampgroundOwnership = (req, res, next) => {
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, campground) => {
            if(err || !campground) {
                req.flash("error", "Ah fiddlesticks! We couldn't load this campground right now. Or maybe ever.");
                res.redirect("back");
            } else {
                if(campground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that. Try being someone else next time.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You're pretty cool, but you need to log in before you can do that.");
        res.redirect("back");
    }
}

middlewareObject.checkCommentOwnership = (req, res, next) => {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, comment) => {
            if(err || !comment) {
                req.flash("error", "Ah fiddlesticks! We couldn't load this comment right now. Or maybe ever.");
                res.redirect("back");
            } else {
                if(comment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that. Try being someone else next time.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You're pretty cool, but you need to log in before you can do that.");
        res.redirect("back");
    }
}

middlewareObject.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You're pretty cool so I'm tempted to let it slide, but you I'll need you to log in before you can do that.");
    res.redirect("/login");
}

module.exports = middlewareObject;
