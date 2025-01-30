const express = require("express");
const multer = require("multer");
const Complaint = require("../models/Complaint");

const router = express.Router();

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/complaints", upload.single("image"), async (req, res) => {
    const { title, description, location } = req.body;
    const newComplaint = new Complaint({
        user: req.session.user._id,
        title,
        description,
        location,
        image: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await newComplaint.save();
    res.redirect("/dashboard");
});

router.post("/complaints/:id/update", async (req, res) => {
    await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect("/dashboard");
});

module.exports = router;
