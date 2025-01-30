const path = require("path");
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Assuming you have the updated User model
const { default: mongoose } = require('mongoose');
const app = express();
const JWT_SECRET = 'your_jwt_secret'; // Change this to an environment variable
const cookieParser = require('cookie-parser');
const Complaint = require('./models/Complaint')

app.use(express.json());
app.use(express.static('public')); // For serving static files like images, CSS, JS
app.use(cookieParser());
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './views'); // Optional, default is './views'
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

        // Set the token in a cookie
        res.cookie('auth_token', token);

        // Send response with token and user info
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, aadharCard: user.aadharCard } });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Middleware to check authentication
const authenticateUser = (req, res, next) => {
    const token = req.cookies.auth_token; // Get token from the cookie

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach user ID to the request body
        req.body.user = decoded.userId;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};



// Admin Home Route (Display only pending complaints)
app.get('/admin-home', authenticateUser, async (req, res) => {
    try {
        // Fetch all pending complaints
        const complaints = await Complaint.find({ status: 'Pending' }).populate('user', 'name email');

        res.render('admin-home.ejs', { complaints }); // Render the page with complaints
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// Register Complaint Route
app.post('/register-complaint', authenticateUser, async (req, res) => {
    try {
        const { title, description, image, location } = req.body;

        // Check if all required fields are provided
        if (!title || !description || !location) {
            return res.status(400).json({ msg: 'Title, description, and location are required' });
        }

        const userId = req.body.user; // Extract user ID from the request body (from the authenticateUser middleware)

        // Create a new complaint
        const newComplaint = new Complaint({
            user: userId,
            title,
            description,
            image, // If an image URL is provided
            location
        });

        // Save the complaint to the database
        await newComplaint.save();

        res.json({ msg: 'Complaint registered successfully', complaint: newComplaint });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error while registering the complaint' });
    }
});



mongoose.connect("mongodb://localhost:27017/codesprint")
.then(() => {
    console.log("Db Connected");
    
    app.listen(3000, () => {
        console.log("Listening on port 3000");
    });
});
