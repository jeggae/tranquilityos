import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tranquilityos_fallback_secret_key';

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

export default router;
