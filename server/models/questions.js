// Question Document Schema
const mongoose = require('mongoose');

// Question Schema
const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    }],
    asked_by: {
        type: String,
        required: true,
    },
    ask_date_time: {
        type: Date,
        default: Date.now,
    },
    views: {
        type: Number,
        default: 0,
    }
});

questionSchema.virtual('url').get(function() {
    return '/posts/question/' + this._id;
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;