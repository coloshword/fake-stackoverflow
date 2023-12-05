// User Document Schema
const mongoose = require('mongoose');

// Admin Schema
const adminSchema = new mongoose.Schema({
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
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    user_date_time: {
        type: Date,
        default: Date.now,
    },
});

adminSchema.virtual('url').get(function() {
    return '/posts/admin/' + this._id;
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;