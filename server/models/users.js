// User Document Schema
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    reputation: {
        type: Number,
        required: true,
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    }],
    user_date_time: {
        type: Date,
        default: Date.now,
    },
});

userSchema.virtual('url').get(function() {
    return '/posts/user/' + this._id;
});

const User = mongoose.model('User', userSchema);

module.exports = User;