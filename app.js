const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const Complaint = require("./models/Complaint");

require("dotenv").config();
const app = express();

connectDB();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

app.use(authRoutes);
app.use(complaintRoutes);

app.get("/dashboard", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    const complaints = await Complaint.find();
    res.render("dashboard", { user: req.session.user, complaints });
});

app.listen(3000, () => console.log("Server running on port 3000"));
