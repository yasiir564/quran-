const express = require('express');
const bodyParser = require('body-parser');
const emailjs = require('emailjs-com'); // Ensure you have installed emailjs-com package
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Dummy database for storing OTPs
let otpDatabase = {};

// Initialize EmailJS
emailjs.init('YOUR_EMAILJS_USER_ID');

// Endpoint to send OTP
app.post('/api/send-otp', (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

    // Store the OTP in the database with an expiration time
    otpDatabase[email] = { otp, expiresAt: Date.now() + 300000 }; // OTP expires in 5 minutes

    const templateParams = {
        to_email: email,
        otp
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(() => {
            res.json({ success: true, message: 'OTP sent successfully.' });
        })
        .catch((error) => {
            console.error('EmailJS Error:', error);
            res.status(500).json({ success: false, message: 'Failed to send OTP.' });
        });
});

// Endpoint to verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, enteredOtp } = req.body;
    const storedOtp = otpDatabase[email];

    if (storedOtp && storedOtp.otp === enteredOtp && storedOtp.expiresAt > Date.now()) {
        delete otpDatabase[email]; // OTP is verified, remove it from the database
        res.json({ success: true, message: 'OTP verified successfully.' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
