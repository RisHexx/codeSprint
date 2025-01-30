const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // role: { type: String, enum: ['citizen', 'municipal_officer'], required: true },
    // age: { type: Number, required: true },
    // gender: { type: String, enum: ['male', 'female', 'other'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
