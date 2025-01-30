const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'in progress', 'resolved'], default: 'pending' },
    city: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
