const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    image: String,
    location: String,
    status: { type: String, enum: ["Pending", "In Progress", "Resolved"], default: "Pending" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
