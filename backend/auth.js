import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import db from './database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tranquilityos_fallback_secret_key';

// Transport configuration for emails
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 2525,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY || 'MISSING_API_KEY'
  }
});

// Register User & Business
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, businessName, industry, currency, country } = req.body;

  if (!firstName || !lastName || !email || !password || !businessName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (row) return res.status(400).json({ error: 'User already exists' });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create Business
      db.run(
        'INSERT INTO businesses (name, industry, currency, country) VALUES (?, ?, ?, ?)',
        [businessName, industry, currency, country],
        function (err) {
          if (err) return res.status(500).json({ error: 'Failed to create business' });
          const businessId = this.lastID;

          // Create User
          db.run(
            'INSERT INTO users (first_name, last_name, email, password_hash, business_id) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, email, passwordHash, businessId],
            function (err) {
              if (err) return res.status(500).json({ error: 'Failed to create user account' });
              const userId = this.lastID;

              // Generate token
              const token = jwt.sign({ userId, businessId, role: 'owner' }, JWT_SECRET, { expiresIn: '7d' });
              res.status(201).json({ message: 'Registration successful', token, user: { id: userId, firstName, lastName, email } });
            }
          );
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login User
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, businessId: user.business_id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email } });
  });
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 3600000; // 1 hour

    db.run('UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?', [resetToken, resetExpires, email], async (updateErr) => {
      if (updateErr) return res.status(500).json({ error: 'Failed to generate reset token' });

      const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: process.env.SENDER_EMAIL || 'no-reply@tranquilityos.com',
        to: user.email,
        subject: 'TranquilityOS Password Reset',
        text: `You requested a password reset. Please click the following link to reset your secure password: ${resetUrl}`
      };

      try {
        if(process.env.SENDGRID_API_KEY) {
           await transporter.sendMail(mailOptions);
        } else {
           console.log(`[SIMULATED EMAIL] Forgot Password Token generated for ${email}:`, resetUrl);
        }
        res.json({ message: 'Reset email generated successfully.' });
      } catch (mailErr) {
        console.error('Email Dispatch Error:', mailErr);
        res.status(500).json({ error: 'Failed to dispatch email check SendGrid config.' });
      }
    });
  });
});

// Reset Password
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Missing parameters' });

  db.get('SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?', [token, Date.now()], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid or expired token' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    db.run('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?', [passwordHash, user.id], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: 'Failed to reset password' });
      res.json({ message: 'Password has been safely reset' });
    });
  });
});

export default router;
