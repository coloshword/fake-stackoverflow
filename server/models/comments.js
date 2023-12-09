// Comment Document Schema
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    comment_by: {
        type: String,
        required: true,
    },
    com_date_time: {
        type: Date,
        default: Date.now,
    },
    com_vote: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
    }],
});

commentSchema.virtual('url').get(function() {
    return '/posts/comment/' + this._id;
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;