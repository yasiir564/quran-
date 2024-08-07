const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for token management
const nodemailer = require('nodemailer'); // For sending OTP emails
const app = express();

app.use(bodyParser.json());

// Middleware to verify Google token
const verifyGoogleToken = (token) => {
    // Verify Google token here
    // Return user profile if valid, otherwise return null
};

// Mock database for storing OTPs (in a real application, use a database)
let otps = {};

// Google Sign-In Route
app.post('/api/google-signin', (req, res) => {
    const { token } = req.body;
    const userProfile = verifyGoogleToken(token);
    if (userProfile) {
        const jwtToken = jwt.sign(userProfile, 'your_secret_key');
        res.json({ success: true, token: jwtToken });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Google token' });
    }
});

// Email OTP Sending Route
app.post('/api/send-otp', (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    otps[email] = otp; // Store OTP in mock database

    // Send OTP via email (using nodemailer)
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }
        res.json({ success: true, message: 'OTP sent' });
    });
});

// OTP Verification Route
app.post('/api/verify-otp', (req, res) => {
    const { email, enteredOtp } = req.body;
    const storedOtp = otps[email];
    if (storedOtp && storedOtp === enteredOtp) {
        delete otps[email]; // Remove OTP after successful verification
        const jwtToken = jwt.sign({ email: email }, 'your_secret_key');
        res.json({ success: true, token: jwtToken });
    } else {
        res.status(401).json({ success: false, message: 'Invalid OTP' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
