const path = require("path");
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Assuming you have the updated User model
const Complaint = require('./models/Complaint'); // Assuming you have the updated User model
const connectDB = require('./db/config');
const { default: mongoose } = require('mongoose');
const app = express();
const JWT_SECRET = 'your_jwt_secret'; // Change this to an environment variable

app.use(express.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password, age, gender, address, aadharCard } = req.body;

        // Check if the user already exists using aadharCard
        let user = await User.findOne({ aadharCard });
        if (user) return res.status(400).json({ msg: 'User with this Aadhar Card already exists' });

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        user = new User({ name, email, password: hashedPassword, age, gender, address, aadharCard });
        await user.save();

        // Create a JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name, email, aadharCard } });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Login Route (using Aadhar Card for login)
app.post('/login', async (req, res) => {
    try {
        const { aadharCard, password } = req.body;

        // Find user by aadharCard
        const user = await User.findOne({ aadharCard });
        if (!user) return res.status(400).json({ msg: 'Invalid Aadhar Card or password' });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Aadhar Card or password' });

        // Create a JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, aadharCard: user.aadharCard } });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Middleware to check authentication
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.body.user = decoded.userId; // Add user ID to request body
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

app.get('/home', async (req, res) => {
  const problems = await Complaint.find().populate('postedBy', 'name'); // Fetch problems with user names
  res.render('home', { problems });
});

mongoose.connect("mongodb://localhost:27017/codesprint")
.then(() => {
    console.log("Db Connected");
    
    app.listen(3000, () => {
        console.log("Listening on port 3000");
    });
});
