// Answer Document Schema
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    ans_by: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
        
    },
    ans_date_time: {
        type: Date,
        default: Date.now,
    },

    ans_vote: {
        type: Number,
        default: 0
    },
    
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
});

answerSchema.virtual('url').get(function() {
    return '/posts/answer/' + this._id;
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;