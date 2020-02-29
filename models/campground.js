const mongoose = require("mongoose");
const Comment = require('./comment');

const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    seed: {
        type: Boolean,
        default: false
    }
});

campgroundSchema.pre('deleteOne', async function() {
    await Comment.deleteOne({
        _id: {
            $in: this.comments
        }
    });
});

module.exports = mongoose.model("Campground", campgroundSchema);
