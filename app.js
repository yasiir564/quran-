const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const emailjs = require('emailjs-com');
const config = require('./config');

const app = express();
const pool = new Pool({
  connectionString: config.POSTGRES_URL,
});

emailjs.init(config.EMAILJS_USER_ID);

app.use(bodyParser.json());

app.post('/api/signup', async (req, res) => {
  const { email, password, username } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, username]
    );
    const user = result.rows[0];
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET);
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/google-signin', async (req, res) => {
  const { email, username, profilePic } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      const insertResult = await pool.query(
        'INSERT INTO users (email, username, profile_pic) VALUES ($1, $2, $3) RETURNING *',
        [email, username, profilePic]
      );
      user = insertResult.rows[0];
    }

    const token = jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/apple-signin', async (req, res) => {
  const { email, username } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      const insertResult = await pool.query(
        'INSERT INTO users (email, username) VALUES ($1, $2) RETURNING *',
        [email, username]
      );
      user = insertResult.rows[0];
    }

    const token = jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const templateParams = {
    user_email: email,
    otp: otp
  };

  try {
    await emailjs.send(config.EMAILJS_SERVICE_ID, config.EMAILJS_TEMPLATE_ID, templateParams);
    res.json({ otp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { otp, enteredOtp } = req.body;

  if (otp === enteredOtp) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid OTP' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
